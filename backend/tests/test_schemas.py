from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.purchase_order import PurchaseOrderCreate


def test_purchase_order_requires_lines() -> None:
    with pytest.raises(ValidationError):
        PurchaseOrderCreate(supplier_id=1, warehouse_id=1, lines=[])


def test_purchase_order_rejects_non_positive_qty() -> None:
    with pytest.raises(ValidationError):
        PurchaseOrderCreate(
            supplier_id=1,
            warehouse_id=1,
            lines=[{"item_id": 1, "qty": 0, "unit_price": Decimal(10)}],
        )


def test_purchase_order_valid() -> None:
    po = PurchaseOrderCreate(
        supplier_id=1,
        warehouse_id=1,
        lines=[{"item_id": 1, "qty": 5, "unit_price": Decimal("12.50")}],
    )
    assert po.lines[0].qty == 5
