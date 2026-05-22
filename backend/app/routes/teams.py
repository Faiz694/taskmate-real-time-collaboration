from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Team, User, Activity

router = APIRouter()


class TeamIn(BaseModel):
    name: str


class JoinIn(BaseModel):
    join_code: str


class MemberOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class TeamOut(BaseModel):
    id: int
    name: str
    join_code: str
    owner_id: int
    members: List[MemberOut] = []

    class Config:
        from_attributes = True


@router.get("/")
def list_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teams = current_user.teams
    result = []
    for team in teams:
        result.append({
            "id": team.id,
            "name": team.name,
            "join_code": team.join_code,
            "owner_id": team.owner_id,
            "members": [{"id": m.id, "name": m.name, "email": m.email} for m in team.members],
        })
    return result


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_team(
    body: TeamIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = Team(name=body.name, owner_id=current_user.id)
    team.members.append(current_user)
    db.add(team)
    db.flush()
    db.add(Activity(
        type="member_joined",
        description=f"{current_user.name} created team \"{team.name}\"",
        team_id=team.id,
        user_id=current_user.id,
    ))
    db.commit()
    db.refresh(team)
    return {
        "id": team.id,
        "name": team.name,
        "join_code": team.join_code,
        "owner_id": team.owner_id,
        "members": [{"id": m.id, "name": m.name, "email": m.email} for m in team.members],
    }


@router.post("/join")
def join_team(
    body: JoinIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.join_code == body.join_code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Invalid join code")
    if current_user in team.members:
        raise HTTPException(status_code=400, detail="Already a member")
    team.members.append(current_user)
    db.add(Activity(
        type="member_joined",
        description=f"{current_user.name} joined the team",
        team_id=team.id,
        user_id=current_user.id,
    ))
    db.commit()
    db.refresh(team)
    return {
        "id": team.id,
        "name": team.name,
        "join_code": team.join_code,
        "owner_id": team.owner_id,
        "members": [{"id": m.id, "name": m.name, "email": m.email} for m in team.members],
    }


@router.get("/{team_id}")
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")
    return {
        "id": team.id,
        "name": team.name,
        "join_code": team.join_code,
        "owner_id": team.owner_id,
        "members": [{"id": m.id, "name": m.name, "email": m.email} for m in team.members],
    }


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if team.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete a team")
    db.delete(team)
    db.commit()
