from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
import models
from gemini import analyze_document

router = APIRouter(
    prefix="/analyze",
    tags=["AI File Analysis"]
)


@router.post("/{file_id}")
def analyze(
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    language: Literal["en", "hi", "pa"] = Query(default="en")
):

    file = db.query(models.StudyFile).filter(
        models.StudyFile.id == file_id,
        models.StudyFile.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    result = analyze_document(file.filepath, language=language)

    return {
        "filename": file.filename,
        "analysis": result
    }