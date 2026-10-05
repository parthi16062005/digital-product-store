from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# =========================
# User Schemas
# =========================

class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================
# Product Schemas
# =========================

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: Optional[str] = None
    price: float = Field(gt=0)
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200
    )
    description: Optional[str] = None
    price: Optional[float] = Field(
        default=None,
        gt=0
    )
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    page: int
    limit: int
    total: int
    total_pages: int


# =========================
# Cart Schemas
# =========================

class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    id: int
    items: list[CartItemResponse]
    total_amount: float


# =========================
# Order Schemas
# =========================

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse]


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    page: int
    limit: int
    total: int
    total_pages: int


# =========================
# Payment Schemas
# =========================

class CheckoutSessionRequest(BaseModel):
    order_id: int = Field(gt=0)