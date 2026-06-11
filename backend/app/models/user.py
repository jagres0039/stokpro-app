import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class UserRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    staff_gudang = "staff_gudang"
    kasir = "kasir"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.staff_gudang)
    is_active: Mapped[bool] = mapped_column(default=True)
