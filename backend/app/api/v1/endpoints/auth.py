from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps import DbSession
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import Token

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    db: DbSession,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = db.scalar(select(User).where(User.email == form.username))
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)
