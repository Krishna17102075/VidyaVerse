from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud

from auth import get_current_user
from database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_dashboard(
        db,
        current_user.id
    )