from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    branches,
    categories,
    invoices,
    items,
    purchase_orders,
    stock,
    suppliers,
    warehouses,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
api_router.include_router(
    purchase_orders.router, prefix="/purchase-orders", tags=["purchase-orders"]
)
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(stock.router, prefix="/stock", tags=["stock"])
