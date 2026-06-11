import enum
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MovementType(str, enum.Enum):
    in_ = "in"
    out = "out"
    transfer = "transfer"
    opname = "opname"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    doc_no: Mapped[str] = mapped_column(String(40), index=True)
    type: Mapped[MovementType] = mapped_column(Enum(MovementType))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    qty: Mapped[int] = mapped_column()
    batch: Mapped[str | None] = mapped_column(String(40), default=None)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
