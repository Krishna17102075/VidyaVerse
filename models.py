from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    Float,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from database import Base


# ==========================
# User Table
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    profile_image = Column(
    String(255),
    nullable=True
)
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    planners = relationship("Planner", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    files = relationship("StudyFile", back_populates="user")

# ==========================
# Notes Table
# ==========================
class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="notes")


# ==========================
# Planner Table
# ==========================
class Planner(Base):
    __tablename__ = "planner"

    id = Column(Integer, primary_key=True, index=True)

    subject = Column(String(100), nullable=False)
    task = Column(String(255), nullable=False)
    deadline = Column(Date, nullable=False)
    status = Column(String(50), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="planners")


# ==========================
# Quiz Table
# ==========================
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    subject = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="quizzes")


class AIChat(Base):
    __tablename__ = "ai_chats"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text)

    answer = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship("User")


class StudyFile(Base):
    __tablename__ = "study_files"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255))

    filepath = Column(String(255))

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="files")