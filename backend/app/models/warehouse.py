from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Warehouse(Base, TimestampMixin):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
