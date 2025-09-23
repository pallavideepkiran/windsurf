from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    id: Optional[int] = None  # allow explicit id for MVP auto-create
    name: str
    email: EmailStr


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class LogCreate(BaseModel):
    user_id: int
    text: str


class LogOut(BaseModel):
    id: int
    user_id: int
    text: str
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SummaryResponse(BaseModel):
    user_id: int
    combined_summary: str
    logs: List[LogOut]


class ReflectResponse(BaseModel):
    user_id: int
    mirror_ready: bool
    reflection: Optional[str] = None
    logs: Optional[List[LogOut]] = None


class MirrorChatRequest(BaseModel):
    user_id: int
    message: str
    history: Optional[List[dict]] = None  # [{"role": "user"|"assistant", "content": "..."}]


class MirrorChatResponse(BaseModel):
    reply: str
