from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.stock_movement import MovementType, StockMovement
from app.schemas.stock import (
    MovementRead,
    OpnameCreate,
    StockLevel,
    TransferCreate,
)
from app.services.numbering import format_doc_no
from app.services.stock import next_sequence, on_hand, post_movement

router = APIRouter()


@router.get("/on-hand", response_model=list[StockLevel])
def stock_on_hand(
    db: DbSession,
    _user: CurrentUser,
    item_id: int | None = None,
    warehouse_id: int | None = None,
) -> list[StockLevel]:
    stmt = select(
        StockMovement.item_id,
        StockMovement.warehouse_id,
        func.coalesce(func.sum(StockMovement.qty), 0).label("qty"),
    ).group_by(StockMovement.item_id, StockMovement.warehouse_id)
    if item_id is not None:
        stmt = stmt.where(StockMovement.item_id == item_id)
    if warehouse_id is not None:
        stmt = stmt.where(StockMovement.warehouse_id == warehouse_id)
    rows = db.execute(stmt).all()
    return [
        StockLevel(item_id=row.item_id, warehouse_id=row.warehouse_id, qty=int(row.qty))
        for row in rows
    ]


@router.get("/movements", response_model=list[MovementRead])
def list_movements(
    db: DbSession,
    _user: CurrentUser,
    item_id: int | None = None,
    warehouse_id: int | None = None,
) -> list[StockMovement]:
    stmt = select(StockMovement).order_by(StockMovement.id.desc()).limit(200)
    if item_id is not None:
        stmt = stmt.where(StockMovement.item_id == item_id)
    if warehouse_id is not None:
        stmt = stmt.where(StockMovement.warehouse_id == warehouse_id)
    return list(db.scalars(stmt))


@router.post("/transfer", response_model=list[MovementRead], status_code=201)
def transfer_stock(
    db: DbSession, user: CurrentUser, payload: TransferCreate
) -> list[StockMovement]:
    if payload.from_warehouse_id == payload.to_warehouse_id:
        raise HTTPException(
            status_code=422, detail="Source and destination warehouses must differ"
        )
    available = on_hand(db, payload.item_id, payload.from_warehouse_id)
    if available < payload.qty:
        raise HTTPException(
            status_code=409,
            detail=f"Insufficient stock (available {available}, requested {payload.qty})",
        )
    doc_no = payload.doc_no or format_doc_no("TRF", next_sequence(db))
    out_mv = post_movement(
        db,
        doc_no=doc_no,
        movement_type=MovementType.transfer,
        item_id=payload.item_id,
        warehouse_id=payload.from_warehouse_id,
        qty=-payload.qty,
        user_id=user.id,
    )
    in_mv = post_movement(
        db,
        doc_no=doc_no,
        movement_type=MovementType.transfer,
        item_id=payload.item_id,
        warehouse_id=payload.to_warehouse_id,
        qty=payload.qty,
        user_id=user.id,
    )
    db.commit()
    db.refresh(out_mv)
    db.refresh(in_mv)
    return [out_mv, in_mv]


@router.post("/opname", response_model=MovementRead, status_code=201)
def stock_opname(
    db: DbSession, user: CurrentUser, payload: OpnameCreate
) -> StockMovement:
    current = on_hand(db, payload.item_id, payload.warehouse_id)
    delta = payload.counted_qty - current
    doc_no = payload.doc_no or format_doc_no("OPN", next_sequence(db))
    movement = post_movement(
        db,
        doc_no=doc_no,
        movement_type=MovementType.opname,
        item_id=payload.item_id,
        warehouse_id=payload.warehouse_id,
        qty=delta,
        user_id=user.id,
    )
    db.commit()
    db.refresh(movement)
    return movement
