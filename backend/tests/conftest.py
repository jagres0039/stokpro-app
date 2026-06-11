import os

os.environ.setdefault("JWT_SECRET", "test-secret-please-change-32chars-minimum")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
