from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.supplier import Supplier
from app.schemas.master import SupplierCreate, SupplierRead

router = APIRouter()


@router.get("", response_model=list[SupplierRead])
def list_suppliers(db: DbSession, _user: CurrentUser) -> list[Supplier]:
    return list(db.scalars(select(Supplier).order_by(Supplier.name)))


@router.post("", response_model=SupplierRead, status_code=201)
def create_supplier(
    db: DbSession, _user: CurrentUser, payload: SupplierCreate
) -> Supplier:
    supplier = Supplier(
        name=payload.name,
        phone=payload.phone,
        email=str(payload.email) if payload.email else None,
        address=payload.address,
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier
