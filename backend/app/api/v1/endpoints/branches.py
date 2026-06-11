from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.branch import Branch
from app.schemas.master import BranchCreate, BranchRead

router = APIRouter()


@router.get("", response_model=list[BranchRead])
def list_branches(db: DbSession, _user: CurrentUser) -> list[Branch]:
    return list(db.scalars(select(Branch).order_by(Branch.code)))


@router.post("", response_model=BranchRead, status_code=201)
def create_branch(db: DbSession, _user: CurrentUser, payload: BranchCreate) -> Branch:
    branch = Branch(**payload.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
