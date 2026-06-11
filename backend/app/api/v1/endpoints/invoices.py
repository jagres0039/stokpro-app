from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.invoice import Invoice, InvoiceLine, InvoiceStatus
from app.models.stock_movement import MovementType
from app.schemas.invoice import InvoiceCreate, InvoiceRead, InvoiceStatusUpdate
from app.services.numbering import format_doc_no
from app.services.stock import on_hand, post_movement

router = APIRouter()


def _generate_invoice_no(db: DbSession, invoice_date: date) -> str:
    count = db.scalar(select(func.count()).select_from(Invoice)) or 0
    return format_doc_no("INV", int(count) + 1, invoice_date)


@router.get("", response_model=list[InvoiceRead])
def list_invoices(db: DbSession, _user: CurrentUser) -> list[Invoice]:
    return list(db.scalars(select(Invoice).order_by(Invoice.id.desc())))


@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: int, db: DbSession, _user: CurrentUser) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.post("", response_model=InvoiceRead, status_code=201)
def create_invoice(db: DbSession, _user: CurrentUser, payload: InvoiceCreate) -> Invoice:
    invoice_date = payload.invoice_date or date.today()
    invoice_no = payload.invoice_no or _generate_invoice_no(db, invoice_date)
    subtotal = Decimal(0)
    for line in payload.lines:
        subtotal += line.unit_price * line.qty
    total = subtotal + payload.tax_amount
    invoice = Invoice(
        invoice_no=invoice_no,
        customer_name=payload.customer_name,
        warehouse_id=payload.warehouse_id,
        invoice_date=invoice_date,
        due_date=payload.due_date,
        note=payload.note,
        subtotal=subtotal,
        tax_amount=payload.tax_amount,
        total_amount=total,
        lines=[
            InvoiceLine(item_id=line.item_id, qty=line.qty, unit_price=line.unit_price)
            for line in payload.lines
        ],
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/issue", response_model=InvoiceRead)
def issue_invoice(invoice_id: int, db: DbSession, user: CurrentUser) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status != InvoiceStatus.draft:
        raise HTTPException(status_code=409, detail="Only draft invoices can be issued")
    for line in invoice.lines:
        available = on_hand(db, line.item_id, invoice.warehouse_id)
        if available < line.qty:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Insufficient stock for item {line.item_id} "
                    f"(available {available}, requested {line.qty})"
                ),
            )
    for line in invoice.lines:
        post_movement(
            db,
            doc_no=invoice.invoice_no,
            movement_type=MovementType.out,
            item_id=line.item_id,
            warehouse_id=invoice.warehouse_id,
            qty=-line.qty,
            user_id=user.id,
        )
    invoice.status = InvoiceStatus.issued
    db.commit()
    db.refresh(invoice)
    return invoice


@router.patch("/{invoice_id}/status", response_model=InvoiceRead)
def update_invoice_status(
    invoice_id: int, db: DbSession, _user: CurrentUser, payload: InvoiceStatusUpdate
) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = payload.status
    db.commit()
    db.refresh(invoice)
    return invoice
