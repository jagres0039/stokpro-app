from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(40), default=None)
    email: Mapped[str | None] = mapped_column(String(255), default=None)
    address: Mapped[str | None] = mapped_column(String(255), default=None)
