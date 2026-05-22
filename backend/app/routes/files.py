import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import File as FileModel, Team, Activity, User

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def file_to_dict(record: FileModel):
    return {
        "id": record.id,
        "filename": record.filename,
        "url": record.url,
        "size_bytes": record.size_bytes,
        "team_id": record.team_id,
        "uploader_id": record.uploader_id,
        "created_at": record.created_at,
        "uploader": {
            "id": record.uploader.id,
            "name": record.uploader.name,
        } if record.uploader else None,
    }


@router.get("/")
def list_files(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")
    records = db.query(FileModel).filter(FileModel.team_id == team_id).all()
    return [file_to_dict(r) for r in records]


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
    team_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.get(Team, team_id)
    if not team or current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a team member")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 20 MB limit")

    ext = os.path.splitext(file.filename)[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    url = f"/uploads/{stored_name}"

    record = FileModel(
        filename=file.filename,
        url=url,
        size_bytes=len(contents),
        team_id=team_id,
        uploader_id=current_user.id,
    )
    db.add(record)
    db.add(Activity(
        type="file_uploaded",
        description=f"{current_user.name} uploaded \"{file.filename}\"",
        team_id=team_id,
        user_id=current_user.id,
    ))
    db.commit()
    db.refresh(record)
    return file_to_dict(record)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.get(FileModel, file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    if record.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can delete this file")

    disk_path = record.url.lstrip("/")
    if os.path.exists(disk_path):
        os.remove(disk_path)

    db.delete(record)
    db.commit()
