from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    address: Mapped[str | None] = mapped_column(String(255), default=None)
