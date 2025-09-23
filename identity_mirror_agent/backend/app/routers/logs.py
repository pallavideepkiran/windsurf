from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..ai import summarize_entry, detect_sentiment, reflect_over_logs, mirror_chat
from ..ai import _anthropic_client  # type: ignore

router = APIRouter(prefix="", tags=["logs"])


@router.post("/log", response_model=schemas.LogOut)
def create_log(payload: schemas.LogCreate, db: Session = Depends(get_db)):
    # Ensure user exists (MVP: auto-create placeholder if missing)
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if user is None:
        user = models.User(id=payload.user_id, name=f"User {payload.user_id}", email=f"user{payload.user_id}@example.com")
        db.add(user)
        db.flush()

    # Create log
    log = models.Log(user_id=payload.user_id, text=payload.text)
    db.add(log)
    db.flush()

    # AI: summarize + sentiment
    try:
        summary = summarize_entry(payload.text)
    except Exception:
        summary = None
    try:
        sentiment = detect_sentiment(payload.text)
    except Exception:
        sentiment = None

    log.summary = summary
    log.sentiment = sentiment
    db.commit()
    db.refresh(log)

    return log


@router.get("/summary/{user_id}", response_model=schemas.SummaryResponse)
def get_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    logs: List[models.Log] = (
        db.query(models.Log)
        .filter(models.Log.user_id == user_id)
        .order_by(models.Log.created_at.desc())
        .limit(5)
        .all()
    )

    texts = [l.text for l in reversed(logs)]  # chronological order
    if texts:
        try:
            combined = reflect_over_logs(user.name, texts)
        except Exception as e:
            # Fallback: deterministic minimal summary if AI provider fails
            print("[WARN] reflect_over_logs failed in /summary:", e)
            sentiments = [detect_sentiment(t) for t in texts]
            pos = sentiments.count("positive")
            neg = sentiments.count("negative")
            neu = sentiments.count("neutral")
            combined = (
                f"Recent {len(texts)} entries show tones — positive: {pos}, neutral: {neu}, negative: {neg}. "
                "Keep noticing patterns across days and acknowledge small wins."
            )
    else:
        combined = "No logs yet. Submit your first entry to begin."

    return schemas.SummaryResponse(
        user_id=user_id,
        combined_summary=combined,
        logs=list(reversed(logs)),  # oldest first in response
    )


@router.get("/reflect/{user_id}", response_model=schemas.ReflectResponse)
def reflect(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    logs: List[models.Log] = (
        db.query(models.Log)
        .filter(models.Log.user_id == user_id)
        .order_by(models.Log.created_at.desc())
        .limit(5)
        .all()
    )

    if len(logs) < 5:
        return schemas.ReflectResponse(user_id=user_id, mirror_ready=False, logs=list(reversed(logs)))

    texts = [l.text for l in reversed(logs)]
    try:
        reflection = reflect_over_logs(user.name, texts)
    except Exception as e:
        print("[WARN] reflect_over_logs failed in /reflect:", e)
        sentiments = [detect_sentiment(t) for t in texts]
        pos = sentiments.count("positive")
        neg = sentiments.count("negative")
        neu = sentiments.count("neutral")
        reflection = (
            f"Mirror Reflection for {user.name}:\n"
            f"Across your recent days (positive: {pos}, neutral: {neu}, negative: {neg}), you show resilience and awareness. "
            "Consider one small habit this week that supports your energy."
        )
    return schemas.ReflectResponse(
        user_id=user_id,
        mirror_ready=True,
        reflection=reflection,
        logs=list(reversed(logs)),
    )


@router.post("/mirror-chat", response_model=schemas.MirrorChatResponse)
def mirror_chat_endpoint(payload: schemas.MirrorChatRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    reply = mirror_chat(user.name, payload.message, payload.history)
    return schemas.MirrorChatResponse(reply=reply)


@router.get("/debug/ai")
def debug_ai_connectivity():
    """Attempt a tiny Anthropic call and return result or error for troubleshooting."""
    client = _anthropic_client()
    if client is None:
        return {"ok": False, "reason": "no_client", "detail": "Anthropic not configured or missing API key"}
    try:
        msg = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=10,
            messages=[{"role": "user", "content": "Say OK"}],
        )
        text = getattr(msg.content[0], "text", str(msg))
        return {"ok": True, "reply": text}
    except Exception as e:
        return {"ok": False, "reason": "exception", "detail": str(e)}
