import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from models import User
from auth import hash_password


# Test database
TEST_DATABASE_URL = "sqlite:///./test_store.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    admin = User(
        name="Test Admin",
        email="admin@test.com",
        hashed_password=hash_password("admin123"),
        role="ADMIN"
    )

    user = User(
        name="Test User",
        email="user@test.com",
        hashed_password=hash_password("password123"),
        role="USER"
    )

    db.add(admin)
    db.add(user)
    db.commit()

    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


def get_admin_token():
    response = client.post(
        "/auth/login",
        data={
            "username": "admin@test.com",
            "password": "admin123"
        }
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def get_user_token():
    response = client.post(
        "/auth/login",
        data={
            "username": "user@test.com",
            "password": "password123"
        }
    )

    assert response.status_code == 200

    return response.json()["access_token"]


# 1. Registration
def test_registration():
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"

    response = client.post(
        "/auth/register",
        json={
            "name": "New User",
            "email": email,
            "password": "password123"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "New User"
    assert data["email"] == email
    assert data["role"] == "USER"


# 2. Login
def test_login():
    response = client.post(
        "/auth/login",
        data={
            "username": "user@test.com",
            "password": "password123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


# 3. Invalid login
def test_invalid_login():
    response = client.post(
        "/auth/login",
        data={
            "username": "user@test.com",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


# 4. Product creation
def test_product_creation():
    token = get_admin_token()

    response = client.post(
        "/products",
        json={
            "name": "Python Course",
            "description": "Python backend development course",
            "price": 1499,
            "image_url": None
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Python Course"
    assert data["price"] == 1499


# 5. Product listing
def test_product_listing():
    token = get_admin_token()

    client.post(
        "/products",
        json={
            "name": "FastAPI Course",
            "description": "FastAPI backend course",
            "price": 1999,
            "image_url": None
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    response = client.get("/products")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total" in data
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "FastAPI Course"


# 6. Product pagination
def test_product_pagination():
    token = get_admin_token()

    for number in range(5):
        response = client.post(
            "/products",
            json={
                "name": f"Course {number + 1}",
                "description": f"Course description {number + 1}",
                "price": 1000 + number,
                "image_url": None
            },
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

        assert response.status_code == 201

    response = client.get(
        "/products",
        params={
            "page": 1,
            "limit": 2
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2


# 7. Cart operation
def test_cart_operation():
    admin_token = get_admin_token()

    product_response = client.post(
        "/products",
        json={
            "name": "Backend Course",
            "description": "Backend development course",
            "price": 1499,
            "image_url": None
        },
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert product_response.status_code == 201

    product_id = product_response.json()["id"]

    user_token = get_user_token()

    response = client.post(
        "/cart/items",
        json={
            "product_id": product_id,
            "quantity": 2
        },
        headers={
            "Authorization": f"Bearer {user_token}"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product_id
    assert data["items"][0]["quantity"] == 2
    assert data["total_amount"] == 2998


# 8. Order and payment functionality
def test_order_and_payment_functionality():
    admin_token = get_admin_token()

    product_response = client.post(
        "/products",
        json={
            "name": "Payment Course",
            "description": "Payment testing course",
            "price": 999,
            "image_url": None
        },
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert product_response.status_code == 201

    product_id = product_response.json()["id"]

    user_token = get_user_token()

    cart_response = client.post(
        "/cart/items",
        json={
            "product_id": product_id,
            "quantity": 1
        },
        headers={
            "Authorization": f"Bearer {user_token}"
        }
    )

    assert cart_response.status_code == 201

    order_response = client.post(
        "/orders",
        headers={
            "Authorization": f"Bearer {user_token}"
        }
    )

    assert order_response.status_code == 201

    order_data = order_response.json()

    assert order_data["status"] == "PENDING"
    assert order_data["total_amount"] == 999

    order_id = order_data["id"]

    payment_response = client.get(
        f"/payments/{order_id}",
        headers={
            "Authorization": f"Bearer {user_token}"
        }
    )

    assert payment_response.status_code == 200

    payment_data = payment_response.json()

    assert payment_data["order_id"] == order_id
    assert payment_data["payment_status"] == "PENDING"
    assert payment_data["amount"] == 999


# 9. Unauthorized access
def test_unauthorized_access():
    response = client.get("/cart")

    assert response.status_code == 401