
import os
import uuid
import secrets
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import crud
import schemas
import models

from models import User

from auth import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user
)

from database import get_db


# ==========================================
# ROUTER CONFIGURATION
# ==========================================

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ==========================================
# GOOGLE CONFIGURATION
# ==========================================

# app.py loads Backend/.env before importing this router.
# Do not load .env again in this file.

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

print("======================================")
print("VIDYAVERSE USER ROUTER")
print("======================================")
print("Google Client ID loaded:", bool(GOOGLE_CLIENT_ID))
print("======================================")


# ==========================================
# BACKEND DIRECTORIES
# ==========================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

PROFILE_UPLOAD_DIR = (
    BACKEND_DIR / "uploads" / "profiles"
)

PROFILE_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# USER SIGNUP
# ==========================================

@router.post("/signup")
def signup(
    user: schemas.UserSignup,
    db: Session = Depends(get_db)
):

    email = user.email.lower().strip()

    existing_user = crud.get_user_by_email(
        db,
        email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    user.email = email

    try:
        new_user = crud.create_user(
            db,
            user
        )

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to register user"
        )


# ==========================================
# NORMAL USER LOGIN
# ==========================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    email = form_data.username.lower().strip()

    user = crud.get_user_by_email(
        db,
        email
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    if not verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    access_token = create_access_token({
        "sub": user.email
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image
        }
    }


# ==========================================
# GOOGLE LOGIN
# ==========================================

@router.post("/google-login")
def google_login(
    payload: dict,
    db: Session = Depends(get_db)
):

    # Check Google Client ID configuration
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail=(
                "Google Client ID is not configured. "
                "Check Backend/.env and restart the backend."
            )
        )

    credential = payload.get("credential")

    if not credential:
        raise HTTPException(
            status_code=400,
            detail="Google credential is missing"
        )

    # Verify Google ID token
    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google login token"
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Unable to verify Google account"
        )

    # Extract verified Google account information
    email = google_user.get("email")

    name = google_user.get("name") or "Google User"

    email_verified = google_user.get(
        "email_verified",
        False
    )

    if not email or not email_verified:
        raise HTTPException(
            status_code=401,
            detail="Google email is missing or not verified"
        )

    email = email.lower().strip()

    # Check whether the user already exists
    user = crud.get_user_by_email(
        db,
        email
    )

    # Create a new VidyaVerse account if necessary
    if user is None:

        random_password = secrets.token_urlsafe(32)

        hashed_password = hash_password(
            random_password
        )

        new_user = User(
            name=name,
            email=email,
            password=hashed_password
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            user = new_user

        except Exception:
            db.rollback()

            # Check again in case another request
            # created this email at the same time.
            user = crud.get_user_by_email(
                db,
                email
            )

            if user is None:
                raise HTTPException(
                    status_code=500,
                    detail="Unable to create VidyaVerse account"
                )

    # Generate VidyaVerse access token
    access_token = create_access_token({
        "sub": user.email
    })

    return {
        "message": "Google login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image
        }
    }


# ==========================================
# GET CURRENT USER
# ==========================================

@router.get("/me", response_model=schemas.UserMeResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "profile_image": current_user.profile_image
    }


# ==========================================
# UPLOAD PROFILE IMAGE
# ==========================================

@router.post("/profile-image")
def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    file_content = file.file.read()

    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB"
        )

    extension = allowed_types[file.content_type]

    filename = (
        f"{current_user.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = PROFILE_UPLOAD_DIR / filename

    try:
        with open(file_path, "wb") as image_file:
            image_file.write(file_content)

        # Remove previous profile image if it belongs
        # to this user's profile uploads directory.
        old_image = current_user.profile_image

        if old_image:
            old_filename = old_image.rsplit("/", 1)[-1]

            old_path = (
                PROFILE_UPLOAD_DIR / old_filename
            ).resolve()

            if (
                old_path.parent == PROFILE_UPLOAD_DIR.resolve()
                and old_path.is_file()
            ):
                old_path.unlink()

        # Save the public URL in the database
        current_user.profile_image = (
            f"/uploads/profiles/{filename}"
        )

        db.commit()
        db.refresh(current_user)

        return {
            "message": "Profile image uploaded successfully",
            "profile_image": current_user.profile_image
        }

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail="Unable to upload profile image"
        )

    finally:
        file.file.close()


# ==========================================
# GET PROFILE IMAGE URL
# ==========================================

@router.get("/profile-image")
def get_profile_image(
    current_user: User = Depends(get_current_user)
):

    return {
        "profile_image": current_user.profile_image
    }
