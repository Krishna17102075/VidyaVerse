from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from gemini import ask_ai

router = APIRouter(prefix="/ai", tags=["AI"])


class Question(BaseModel):
    question: str = Field(min_length=1, max_length=12000)
    language: Literal["en", "hi", "pa"] = "en"


@router.post("/ask")
def ask(question: Question):
    answer = ask_ai(question.question, language=question.language)
    return {
        "question": question.question,
        "answer": answer,
        "language": question.language
    }
