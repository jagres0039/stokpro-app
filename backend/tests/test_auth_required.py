import pytest
from fastapi.testclient import TestClient


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/items",
        "/api/v1/categories",
        "/api/v1/suppliers",
        "/api/v1/purchase-orders",
        "/api/v1/invoices",
        "/api/v1/stock/on-hand",
    ],
)
def test_endpoints_require_auth(client: TestClient, path: str) -> None:
    assert client.get(path).status_code == 401
