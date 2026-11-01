from typing import List, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import models
import crud
import schemas

from database import get_db
from auth import get_current_user
from gemini import generate_study_plan

router = APIRouter(
    prefix="/planner",
    tags=["Planner"]
)


@router.post("/create", response_model=schemas.PlannerResponse)
def create_planner(
    planner: schemas.PlannerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return crud.create_planner(
        db,
        planner,
        current_user.id
    )


@router.get("/", response_model=List[schemas.PlannerResponse])
def get_planners(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return crud.get_planners(
        db,
        current_user.id
    )


@router.put("/update/{planner_id}", response_model=schemas.PlannerResponse)
def update_planner(
    planner_id: int,
    planner: schemas.PlannerUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    updated = crud.update_planner(
        db,
        planner_id,
        planner,
        current_user.id
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return updated


@router.delete("/delete/{planner_id}")
def delete_planner(
    planner_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    deleted = crud.delete_planner(
        db,
        planner_id,
        current_user.id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return deleted


@router.post("/generate/{file_id}")
def generate_plan(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    language: Literal["en", "hi", "pa"] = Query(default="en")
):
    file = db.query(models.StudyFile).filter(
        models.StudyFile.id == file_id,
        models.StudyFile.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="Study file not found"
        )

    plan = generate_study_plan(file.filepath, language=language)
    return plan