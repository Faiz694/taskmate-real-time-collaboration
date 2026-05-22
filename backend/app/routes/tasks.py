from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Task, Team, Activity, User

router = APIRouter()


class TaskIn(BaseModel):
    title: str
    description: str = ""
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None
    team_id: int


class TaskPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None


def _log(db, team_id, user_id, event_type, description):
    db.add(Activity(type=event_type, description=description,
                    team_id=team_id, user_id=user_id))


def task_to_dict(task: Task):
    """Serialize a task including the nested assignee object."""
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "deadline": task.deadline,
        "team_id": task.team_id,
        "assignee_id": task.assignee_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "assignee": {
            "id": task.assignee.id,
            "name": task.assignee.name,
            "email": task.assignee.email,
        } if task.assignee else None,
    }


@router.get("/")
def list_tasks(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")
    tasks = db.query(Task).filter(Task.team_id == team_id).all()
    return [task_to_dict(t) for t in tasks]

@router.get("/stats")
def task_stats(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")

    tasks = db.query(Task).filter(Task.team_id == team_id).all()
    now = datetime.now(timezone.utc)
    return {
        "total":       len(tasks),
        "todo":        sum(1 for t in tasks if t.status == "todo"),
        "in_progress": sum(1 for t in tasks if t.status == "in_progress"),
        "completed":   sum(1 for t in tasks if t.status == "completed"),
        "overdue":     sum(
            1 for t in tasks
            if t.deadline and t.deadline < now and t.status != "completed"
        ),
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_task(
    body: TaskIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, body.team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")

    task = Task(**body.model_dump())
    db.add(task)
    db.flush()
    _log(db, body.team_id, current_user.id, "task_created",
         f"{current_user.name} created task \"{task.title}\"")
    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@router.patch("/{task_id}")
def update_task(
    task_id: int,
    body: TaskPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    team = db.get(Team, task.team_id)
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(task, field, value)

    if body.status == "completed":
        _log(db, task.team_id, current_user.id, "task_completed",
             f"{current_user.name} completed \"{task.title}\"")

    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    