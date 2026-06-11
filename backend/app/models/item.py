from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class Item(Base, TimestampMixin):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    barcode: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    name: Mapped[str] = mapped_column(String(200))
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id"), default=None
    )
    min_stock: Mapped[int] = mapped_column(default=0)
    buy_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    sell_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
