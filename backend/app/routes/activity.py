from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Activity, Team, User

router = APIRouter()


@router.get("/")
def list_activity(
    team_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")

    return (
        db.query(Activity)
        .filter(Activity.team_id == team_id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .all()
    )
