from datetime import date


def format_doc_no(prefix: str, seq: int, on: date | None = None) -> str:
    """Build a human-readable document number like ``PO-202606-0001``."""
    on = on or date.today()
    return f"{prefix}-{on:%Y%m}-{seq:04d}"
