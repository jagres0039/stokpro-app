from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.warehouse import Warehouse
from app.schemas.master import WarehouseCreate, WarehouseRead

router = APIRouter()


@router.get("", response_model=list[WarehouseRead])
def list_warehouses(db: DbSession, _user: CurrentUser) -> list[Warehouse]:
    return list(db.scalars(select(Warehouse).order_by(Warehouse.code)))


@router.post("", response_model=WarehouseRead, status_code=201)
def create_warehouse(
    db: DbSession, _user: CurrentUser, payload: WarehouseCreate
) -> Warehouse:
    warehouse = Warehouse(**payload.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse
