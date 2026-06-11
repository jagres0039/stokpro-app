from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.stock_movement import MovementType, StockMovement


def on_hand(db: Session, item_id: int, warehouse_id: int) -> int:
    """Return current stock on hand for an item in a warehouse."""
    stmt = select(func.coalesce(func.sum(StockMovement.qty), 0)).where(
        StockMovement.item_id == item_id,
        StockMovement.warehouse_id == warehouse_id,
    )
    return int(db.scalar(stmt) or 0)


def post_movement(
    db: Session,
    *,
    doc_no: str,
    movement_type: MovementType,
    item_id: int,
    warehouse_id: int,
    qty: int,
    user_id: int | None = None,
    batch: str | None = None,
) -> StockMovement:
    """Create a signed stock movement row. Positive qty adds, negative removes."""
    movement = StockMovement(
        doc_no=doc_no,
        type=movement_type,
        item_id=item_id,
        warehouse_id=warehouse_id,
        qty=qty,
        batch=batch,
        user_id=user_id,
    )
    db.add(movement)
    return movement


def next_sequence(db: Session) -> int:
    """Return the next global movement sequence number."""
    count = db.scalar(select(func.count()).select_from(StockMovement)) or 0
    return int(count) + 1
