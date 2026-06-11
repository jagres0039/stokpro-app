from pydantic import BaseModel, ConfigDict, Field

from app.models.stock_movement import MovementType


class StockLevel(BaseModel):
    item_id: int
    warehouse_id: int
    qty: int


class MovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doc_no: str
    type: MovementType
    item_id: int
    warehouse_id: int
    qty: int


class TransferCreate(BaseModel):
    item_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    qty: int = Field(gt=0)
    doc_no: str | None = Field(default=None, max_length=40)


class OpnameCreate(BaseModel):
    item_id: int
    warehouse_id: int
    counted_qty: int = Field(ge=0)
    doc_no: str | None = Field(default=None, max_length=40)
