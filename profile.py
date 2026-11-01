from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.get("/")
def get_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "profile_image": getattr(current_user, "profile_image", None)
    }