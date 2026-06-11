from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession, token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
    except InvalidTokenError:
        raise creds_exc from None
    if user_id is None:
        raise creds_exc
    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        raise creds_exc
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
