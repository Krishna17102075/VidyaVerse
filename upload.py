
import os
import shutil
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session

import models
from database import get_db
from auth import get_current_user


router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


# ==========================================
# UPLOAD DIRECTORY
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# UPLOAD STUDY FILE
# ==========================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    # Keep only the original filename, not any supplied path.
    original_filename = Path(file.filename).name

    # Give each stored file a unique name.
    stored_filename = (
        f"{uuid.uuid4().hex}_{original_filename}"
    )

    filepath = UPLOAD_FOLDER / stored_filename

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        new_file = models.StudyFile(
            filename=original_filename,
            filepath=str(filepath),
            user_id=current_user.id
        )

        db.add(new_file)
        db.commit()
        db.refresh(new_file)

        return {
            "message": "File uploaded successfully",
            "filename": new_file.filename,
            "id": new_file.id
        }

    except Exception:
        db.rollback()

        if filepath.exists():
            filepath.unlink()

        raise HTTPException(
            status_code=500,
            detail="Unable to upload file"
        )

    finally:
        await file.close()


# ==========================================
# GET USER UPLOADED FILES
# ==========================================

@router.get("/files")
def get_files(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    files = (
        db.query(models.StudyFile)
        .filter(
            models.StudyFile.user_id == current_user.id
        )
        .order_by(models.StudyFile.id.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "filename": item.filename
        }
        for item in files
    ]


# ==========================================
# DELETE AN UPLOADED FILE
# ==========================================

@router.delete("/files/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Find the file belonging to the logged-in user only.
    study_file = (
        db.query(models.StudyFile)
        .filter(
            models.StudyFile.id == file_id,
            models.StudyFile.user_id == current_user.id
        )
        .first()
    )

    if study_file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found or you do not have permission to delete it"
        )

    # Resolve the stored path safely.
    stored_path = Path(study_file.filepath)

    if not stored_path.is_absolute():
        stored_path = BASE_DIR / stored_path

    stored_path = stored_path.resolve()
    upload_root = UPLOAD_FOLDER.resolve()

    # Prevent deleting files outside the uploads directory.
    if (
        stored_path != upload_root
        and upload_root not in stored_path.parents
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid file path"
        )

    # Remove the database record first.
    try:
        db.delete(study_file)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to delete file record"
        )

    # Remove the physical file after successful database deletion.
    try:
        if stored_path.is_file():
            stored_path.unlink()

    except OSError:
        # The database record is already deleted.
        # Log this for manual storage cleanup if necessary.
        print(
            "Could not remove uploaded file from disk:",
            stored_path
        )

    return {
        "message": "File deleted successfully",
        "file_id": file_id
    }
