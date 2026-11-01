from typing import Literal
from fastapi import APIRouter
from pydantic import BaseModel, Field
from gemini import ask_ai

router = APIRouter(prefix="/study-ai", tags=["Study AI"])

class StudyQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=12000)
    language: Literal["en", "hi", "pa"] = "en"

@router.post("/ask")
def ask(question: StudyQuestion):
    prompt = f"You are an expert study assistant. Answer simply and clearly.\n\nQuestion:\n{question.question}"
    answer = ask_ai(prompt, language=question.language)
    return {"answer": answer, "language": question.language}
