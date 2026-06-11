import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class PurchaseOrderStatus(str, enum.Enum):
    draft = "draft"
    ordered = "ordered"
    received = "received"
    cancelled = "cancelled"


class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    po_no: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        Enum(PurchaseOrderStatus), default=PurchaseOrderStatus.draft
    )
    order_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    expected_date: Mapped[date | None] = mapped_column(Date, default=None)
    note: Mapped[str | None] = mapped_column(String(255), default=None)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal(0))

    lines: Mapped[list["PurchaseOrderLine"]] = relationship(
        back_populates="purchase_order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    purchase_order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE"), index=True
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    qty: Mapped[int] = mapped_column()
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal(0))

    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="lines")
