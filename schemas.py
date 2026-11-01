from pydantic import BaseModel
from typing import Optional
from datetime import date


# ==========================
# User Schemas
# ==========================

class UserSignup(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    id: int
    name: str
    email: str
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


# ==========================
# Note Schemas
# ==========================

class NoteCreate(BaseModel):
    title: str
    content: str


class NoteUpdate(BaseModel):
    title: str
    content: str


class NoteResponse(NoteCreate):
    id: int

    class Config:
        from_attributes = True


# ==========================
# Planner Schemas
# ==========================

class PlannerCreate(BaseModel):
    subject: str
    task: str
    deadline: str
    status: str = "Pending"


class PlannerUpdate(BaseModel):
    subject: str
    task: str
    deadline: str
    status: str


class PlannerResponse(BaseModel):
    id: int
    subject: str
    task: str
    deadline: date
    status: str

    class Config:
        from_attributes = True


# ==========================
# Quiz Schemas
# ==========================

class QuizCreate(BaseModel):
    subject: str
    score: int
    total_questions: int
    percentage: float


class QuizResponse(QuizCreate):
    id: int

    class Config:
        from_attributes = True