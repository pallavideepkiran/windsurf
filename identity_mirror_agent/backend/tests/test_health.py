import os
import pytest
from fastapi.testclient import TestClient

os.environ["SKIP_DB_CREATE"] = "1"

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
