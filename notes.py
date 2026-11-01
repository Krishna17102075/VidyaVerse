from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
import crud
import schemas

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


@router.post("/create")
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return crud.create_note(
        db,
        note.title,
        note.content,
        current_user.id
    )


@router.get("/")
def get_notes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return crud.get_notes(
        db,
        current_user.id
    )

@router.put("/update/{note_id}")
def update_note(
    note_id: int,
    note: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    updated = crud.update_note(
        db,
        note_id,
        note.title,
        note.content,
        current_user.id
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return updated

@router.delete("/delete/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    deleted = crud.delete_note(
        db,
        note_id,
        current_user.id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return deleted