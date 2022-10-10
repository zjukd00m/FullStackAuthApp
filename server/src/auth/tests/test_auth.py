import warnings
from fastapi.testclient import TestClient
import json
import csv
import os
from ...index import app
from ...settings import BASE_DIR


warnings.filterwarnings(
    "ignore", ".*Class SelectOfScalar will not make use of SQL compilation caching.*"
)


headers = {
    "Content-Type": "application/json",
    "X-Auth-Token": "8eac41b896dd67958bcc8162ac6753d08ba16eb8ac3915fcb3655e9fd9d6c8c0",
}

base_path = os.getcwd()
user_csv_path = os.path.join(BASE_DIR, "users.csv")

client = TestClient(app)


# TODO: Use pydantic classes to validate the csv files
def get_users():
    users = []
    with open(user_csv_path, "r") as f:
        users_iterator = csv.reader(f, delimiter=",", quotechar="|")
        for _user in users_iterator:
            email = _user[0]
            name = _user[1]
            age = _user[2]
            phoneNumber = _user[3]
            avatar = _user[4]
            password = _user[5]

            profile = dict(name=name, age=age, phoneNumber=phoneNumber, avatar=avatar)

            user = dict(
                email=email,
                password=password,
                profile=profile,
            )

            users.append(user)

        return users


# It should validate the authentication flow with email and password
def test_signup():
    users = get_users()

    user = users[1]

    payload = json.dumps(user)

    r = client.post("api/auth/signup", payload, headers=headers)

    assert r.status_code == 200

    data = r.json()

    assert type(data["id"]) == int

    r = client.post("api/auth/signup", payload, headers=headers)

    assert r.status_code == 400

    payload = json.dumps(dict(email=user["email"], password=user["password"]))

    r = client.post(
        "api/auth/signin",
        payload,
        headers=headers,
    )

    assert r.status_code == 200

    r = client.get(f"api/auth/{data['id']}")

    assert r.status_code == 200

    r = client.delete(f"api/auth/{data['id']}")

    assert r.status_code == 200

    r = client.get(f"api/auth/{data['id']}")

    assert r.status_code == 404
