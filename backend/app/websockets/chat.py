import socketio
from jose import JWTError

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import Message, User

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)


def _get_user_from_token(token: str):
    """Decode JWT and return the User object, or None."""
    try:
        from jose import jwt
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload.get("sub"))
        db = SessionLocal()
        try:
            return db.get(User, user_id)
        finally:
            db.close()
    except (JWTError, TypeError, ValueError):
        return None


@sio.event
async def connect(sid, environ, auth):
    token = (auth or {}).get("token")
    user = _get_user_from_token(token) if token else None
    if not user:
        return False  # Reject unauthenticated connections
    await sio.save_session(sid, {"user_id": user.id, "user_name": user.name})


@sio.event
async def join_room(sid, data):
    team_id = data.get("team_id")
    if not team_id:
        return
    room = f"team_{team_id}"
    await sio.enter_room(sid, room)

    # Send last 50 messages as history
    db = SessionLocal()
    try:
        messages = (
            db.query(Message)
            .filter(Message.team_id == team_id)
            .order_by(Message.created_at.asc())
            .limit(50)
            .all()
        )
        history = [
            {
                "id": m.id,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
                "sender": {"id": m.sender.id, "name": m.sender.name},
            }
            for m in messages
        ]
    finally:
        db.close()

    await sio.emit("message_history", history, to=sid)


@sio.event
async def send_message(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    user_name = session.get("user_name")
    team_id = data.get("team_id")
    content = (data.get("content") or "").strip()

    if not content or not team_id:
        return

    db = SessionLocal()
    try:
        msg = Message(content=content, team_id=team_id, sender_id=user_id)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        payload = {
            "id": msg.id,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
            "sender": {"id": user_id, "name": user_name},
        }
    finally:
        db.close()

    await sio.emit("new_message", payload, room=f"team_{team_id}")


@sio.event
async def disconnect(sid):
    pass
