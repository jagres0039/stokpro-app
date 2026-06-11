from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.category import Category
from app.schemas.master import CategoryCreate, CategoryRead

router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories(db: DbSession, _user: CurrentUser) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


@router.post("", response_model=CategoryRead, status_code=201)
def create_category(
    db: DbSession, _user: CurrentUser, payload: CategoryCreate
) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
