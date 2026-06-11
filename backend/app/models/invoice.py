import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    issued = "issued"
    paid = "paid"
    void = "void"


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_no: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(160))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    status: Mapped[InvoiceStatus] = mapped_column(
        Enum(InvoiceStatus), default=InvoiceStatus.draft
    )
    invoice_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    due_date: Mapped[date | None] = mapped_column(Date, default=None)
    note: Mapped[str | None] = mapped_column(String(255), default=None)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal(0))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal(0))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal(0))

    lines: Mapped[list["InvoiceLine"]] = relationship(
        back_populates="invoice",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="CASCADE"), index=True
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    qty: Mapped[int] = mapped_column()
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal(0))

    invoice: Mapped["Invoice"] = relationship(back_populates="lines")
