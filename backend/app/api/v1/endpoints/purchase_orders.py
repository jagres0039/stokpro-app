from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseOrderStatus,
)
from app.models.stock_movement import MovementType
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderStatusUpdate,
)
from app.services.numbering import format_doc_no
from app.services.stock import post_movement

router = APIRouter()


def _generate_po_no(db: DbSession, order_date: date) -> str:
    count = db.scalar(select(func.count()).select_from(PurchaseOrder)) or 0
    return format_doc_no("PO", int(count) + 1, order_date)


@router.get("", response_model=list[PurchaseOrderRead])
def list_purchase_orders(db: DbSession, _user: CurrentUser) -> list[PurchaseOrder]:
    return list(db.scalars(select(PurchaseOrder).order_by(PurchaseOrder.id.desc())))


@router.get("/{po_id}", response_model=PurchaseOrderRead)
def get_purchase_order(po_id: int, db: DbSession, _user: CurrentUser) -> PurchaseOrder:
    po = db.get(PurchaseOrder, po_id)
    if po is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po


@router.post("", response_model=PurchaseOrderRead, status_code=201)
def create_purchase_order(
    db: DbSession, _user: CurrentUser, payload: PurchaseOrderCreate
) -> PurchaseOrder:
    order_date = payload.order_date or date.today()
    po_no = payload.po_no or _generate_po_no(db, order_date)
    total = Decimal(0)
    for line in payload.lines:
        total += line.unit_price * line.qty
    po = PurchaseOrder(
        po_no=po_no,
        supplier_id=payload.supplier_id,
        warehouse_id=payload.warehouse_id,
        order_date=order_date,
        expected_date=payload.expected_date,
        note=payload.note,
        total_amount=total,
        lines=[
            PurchaseOrderLine(
                item_id=line.item_id, qty=line.qty, unit_price=line.unit_price
            )
            for line in payload.lines
        ],
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return po


@router.post("/{po_id}/receive", response_model=PurchaseOrderRead)
def receive_purchase_order(po_id: int, db: DbSession, user: CurrentUser) -> PurchaseOrder:
    po = db.get(PurchaseOrder, po_id)
    if po is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if po.status == PurchaseOrderStatus.received:
        raise HTTPException(status_code=409, detail="Purchase order already received")
    if po.status == PurchaseOrderStatus.cancelled:
        raise HTTPException(status_code=409, detail="Purchase order is cancelled")
    for line in po.lines:
        post_movement(
            db,
            doc_no=po.po_no,
            movement_type=MovementType.in_,
            item_id=line.item_id,
            warehouse_id=po.warehouse_id,
            qty=line.qty,
            user_id=user.id,
        )
    po.status = PurchaseOrderStatus.received
    db.commit()
    db.refresh(po)
    return po


@router.patch("/{po_id}/status", response_model=PurchaseOrderRead)
def update_purchase_order_status(
    po_id: int, db: DbSession, _user: CurrentUser, payload: PurchaseOrderStatusUpdate
) -> PurchaseOrder:
    po = db.get(PurchaseOrder, po_id)
    if po is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    po.status = payload.status
    db.commit()
    db.refresh(po)
    return po
