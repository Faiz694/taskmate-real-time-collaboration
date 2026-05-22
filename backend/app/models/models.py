import secrets
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text, Table
)
from sqlalchemy.orm import relationship

from app.core.database import Base

# ── Association table: team members ─────────────────────────────────────────

team_members = Table(
    "team_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id"), primary_key=True),
)


# ── User ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    teams      = relationship("Team", secondary=team_members, back_populates="members")
    tasks      = relationship("Task", back_populates="assignee")
    messages   = relationship("Message", back_populates="sender")


# ── Team ─────────────────────────────────────────────────────────────────────

class Team(Base):
    __tablename__ = "teams"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    join_code  = Column(String(12), unique=True, default=lambda: secrets.token_urlsafe(8))
    owner_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner      = relationship("User", foreign_keys=[owner_id])
    members    = relationship("User", secondary=team_members, back_populates="teams")
    tasks      = relationship("Task",    back_populates="team", cascade="all, delete-orphan")
    files      = relationship("File",    back_populates="team", cascade="all, delete-orphan")
    messages   = relationship("Message", back_populates="team", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="team", cascade="all, delete-orphan")


# ── Task ─────────────────────────────────────────────────────────────────────

class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, default="")
    status      = Column(String(20), default="todo")   # todo | in_progress | completed
    deadline    = Column(DateTime(timezone=True), nullable=True)
    team_id     = Column(Integer, ForeignKey("teams.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at  = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    team        = relationship("Team", back_populates="tasks")
    assignee    = relationship("User", back_populates="tasks")


# ── File ─────────────────────────────────────────────────────────────────────

class File(Base):
    __tablename__ = "files"

    id          = Column(Integer, primary_key=True, index=True)
    filename    = Column(String(255), nullable=False)
    url         = Column(String(500), nullable=False)
    size_bytes  = Column(Integer, default=0)
    team_id     = Column(Integer, ForeignKey("teams.id"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    team        = relationship("Team", back_populates="files")
    uploader    = relationship("User")


# ── Message ──────────────────────────────────────────────────────────────────

class Message(Base):
    __tablename__ = "messages"

    id         = Column(Integer, primary_key=True, index=True)
    content    = Column(Text, nullable=False)
    team_id    = Column(Integer, ForeignKey("teams.id"), nullable=False)
    sender_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    team       = relationship("Team", back_populates="messages")
    sender     = relationship("User", back_populates="messages")


# ── Activity ─────────────────────────────────────────────────────────────────

class Activity(Base):
    __tablename__ = "activities"

    id          = Column(Integer, primary_key=True, index=True)
    type        = Column(String(40), nullable=False)   # task_created | task_completed | …
    description = Column(String(300), nullable=False)
    team_id     = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    team        = relationship("Team", back_populates="activities")
