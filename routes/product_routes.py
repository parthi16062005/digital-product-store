from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product, User
from schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from dependencies import get_current_admin


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin)
):
    product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        image_url=product_data.image_url,
        is_active=True
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.get(
    "",
    response_model=ProductListResponse
)
def get_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(
        Product.is_active == True
    )

    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )

    total = query.count()

    total_pages = ceil(total / limit) if total > 0 else 0

    products = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": products,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.is_active == True
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    update_data = product_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product.is_active = False

    db.commit()

    return {
        "message": "Product deleted successfully"
    }