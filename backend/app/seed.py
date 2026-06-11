"""Seed the database with demo master data and an initial user.

Run with: python -m app.seed
Run migrations first (alembic upgrade head). Idempotent: existing rows
(matched by unique key) are left untouched.
"""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.branch import Branch
from app.models.category import Category
from app.models.item import Item
from app.models.supplier import Supplier
from app.models.user import User, UserRole
from app.models.warehouse import Warehouse

DEMO_EMAIL = "admin@stokpro.local"
DEMO_PASSWORD = "admin12345"


def _seed_user(db: Session) -> None:
    if db.scalar(select(User).where(User.email == DEMO_EMAIL)) is not None:
        return
    db.add(
        User(
            name="Admin StokPro",
            email=DEMO_EMAIL,
            hashed_password=hash_password(DEMO_PASSWORD),
            role=UserRole.owner,
        )
    )


def _seed_categories(db: Session) -> None:
    existing = set(db.scalars(select(Category.name)))
    for name in ["Elektronik", "ATK", "Konsumsi", "Sparepart"]:
        if name not in existing:
            db.add(Category(name=name))


def _seed_suppliers(db: Session) -> None:
    suppliers = [
        ("PT Sumber Makmur", "021-5551234", "sales@sumbermakmur.co.id"),
        ("CV Mitra Jaya", "022-7778899", "order@mitrajaya.co.id"),
    ]
    existing = set(db.scalars(select(Supplier.name)))
    for name, phone, email in suppliers:
        if name not in existing:
            db.add(Supplier(name=name, phone=phone, email=email))


def _seed_branch_and_warehouses(db: Session) -> None:
    branch = db.scalar(select(Branch).where(Branch.code == "HQ"))
    if branch is None:
        branch = Branch(code="HQ", name="Kantor Pusat", address="Jakarta")
        db.add(branch)
        db.flush()
    existing = set(db.scalars(select(Warehouse.code)))
    for code, name in [("WH-01", "Gudang Utama"), ("WH-02", "Gudang Cabang")]:
        if code not in existing:
            db.add(Warehouse(code=code, name=name, branch_id=branch.id))


def _seed_items(db: Session) -> None:
    items = [
        ("SKU-001", "Kabel HDMI 2m", "pcs", Decimal("25000"), Decimal("45000")),
        ("SKU-002", "Mouse Wireless", "pcs", Decimal("65000"), Decimal("110000")),
        ("SKU-003", "Kertas A4 80gsm", "rim", Decimal("42000"), Decimal("58000")),
        ("SKU-004", "Pulpen Hitam", "pcs", Decimal("1500"), Decimal("3500")),
    ]
    existing = set(db.scalars(select(Item.sku)))
    for sku, name, unit, buy, sell in items:
        if sku not in existing:
            db.add(
                Item(sku=sku, name=name, unit=unit, buy_price=buy, sell_price=sell)
            )


def main() -> None:
    db = SessionLocal()
    try:
        _seed_user(db)
        _seed_categories(db)
        _seed_suppliers(db)
        _seed_branch_and_warehouses(db)
        _seed_items(db)
        db.commit()
        print(f"Seed complete. Login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
