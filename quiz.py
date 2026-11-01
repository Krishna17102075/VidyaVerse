from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
import models
from database import get_db
from auth import get_current_user
from gemini import generate_quiz

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)


@router.post("/create", response_model=schemas.QuizResponse)
def create_quiz_result(
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Save completed quiz attempt to the database."""
    saved = crud.create_quiz(
        db=db,
        quiz=quiz,
        user_id=current_user.id
    )
    return saved


@router.post("/{file_id}")
def generate_quiz_from_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate a 10-question AI quiz from an uploaded study file."""
    file = db.query(models.StudyFile).filter(
        models.StudyFile.id == file_id,
        models.StudyFile.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    quiz_questions = generate_quiz(file.filepath)
    return quiz_questions


@router.get("/", response_model=List[schemas.QuizResponse])
def get_quizzes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return crud.get_quizzes(
        db,
        current_user.id
    )


@router.delete("/delete/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    deleted = crud.delete_quiz(
        db,
        quiz_id,
        current_user.id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )

    return deleted