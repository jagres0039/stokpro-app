from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    sku: str = Field(max_length=40)
    name: str = Field(max_length=200)
    unit: str = "pcs"
    barcode: str | None = None
    category_id: int | None = None
    min_stock: int = Field(default=0, ge=0)
    buy_price: Decimal = Field(default=Decimal(0), ge=0)
    sell_price: Decimal = Field(default=Decimal(0), ge=0)


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
