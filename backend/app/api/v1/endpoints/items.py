from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemRead

router = APIRouter()


@router.get("", response_model=list[ItemRead])
def list_items(db: DbSession, _user: CurrentUser) -> list[Item]:
    return list(db.scalars(select(Item).order_by(Item.sku)))


@router.post("", response_model=ItemRead, status_code=201)
def create_item(db: DbSession, _user: CurrentUser, payload: ItemCreate) -> Item:
    item = Item(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
