from email import header
from fastapi.testclient import TestClient
from src.index import app


headers = {"Content-Type": "application/json", "X-Auth-Token": ""}


client = TestClient(app)


def generate_token():
    pass


def test_generate_token():
    email = "zjukd00m@protonmail.com"

    r = client.post("api/token", header="headers")

    assert r.status_code == 422

    r = client.post(f"api/token?email={email}", headers=headers)

    assert r.status_code == 200
