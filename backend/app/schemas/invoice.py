from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.invoice import InvoiceStatus


class InvoiceLineCreate(BaseModel):
    item_id: int
    qty: int = Field(gt=0)
    unit_price: Decimal = Field(default=Decimal(0), ge=0)


class InvoiceLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    qty: int
    unit_price: Decimal


class InvoiceCreate(BaseModel):
    customer_name: str = Field(max_length=160)
    warehouse_id: int
    invoice_no: str | None = Field(default=None, max_length=40)
    invoice_date: date | None = None
    due_date: date | None = None
    note: str | None = Field(default=None, max_length=255)
    tax_amount: Decimal = Field(default=Decimal(0), ge=0)
    lines: list[InvoiceLineCreate] = Field(min_length=1)


class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_no: str
    customer_name: str
    warehouse_id: int
    status: InvoiceStatus
    invoice_date: date
    due_date: date | None
    note: str | None
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    lines: list[InvoiceLineRead]


class InvoiceStatusUpdate(BaseModel):
    status: InvoiceStatus
