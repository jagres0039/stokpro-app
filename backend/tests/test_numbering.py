from datetime import date

from app.services.numbering import format_doc_no


def test_format_doc_no_pads_sequence() -> None:
    assert format_doc_no("PO", 1, date(2026, 6, 11)) == "PO-202606-0001"


def test_format_doc_no_large_sequence() -> None:
    assert format_doc_no("INV", 1234, date(2026, 1, 1)) == "INV-202601-1234"
