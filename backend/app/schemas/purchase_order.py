from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.purchase_order import PurchaseOrderStatus


class POLineCreate(BaseModel):
    item_id: int
    qty: int = Field(gt=0)
    unit_price: Decimal = Field(default=Decimal(0), ge=0)


class POLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    qty: int
    unit_price: Decimal


class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    warehouse_id: int
    po_no: str | None = Field(default=None, max_length=40)
    order_date: date | None = None
    expected_date: date | None = None
    note: str | None = Field(default=None, max_length=255)
    lines: list[POLineCreate] = Field(min_length=1)


class PurchaseOrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    po_no: str
    supplier_id: int
    warehouse_id: int
    status: PurchaseOrderStatus
    order_date: date
    expected_date: date | None
    note: str | None
    total_amount: Decimal
    lines: list[POLineRead]


class PurchaseOrderStatusUpdate(BaseModel):
    status: PurchaseOrderStatus
