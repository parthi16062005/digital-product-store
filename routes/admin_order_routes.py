from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_admin
from models import Order, User
from schemas import OrderResponse, OrderListResponse, OrderItemResponse


router = APIRouter(
    prefix="/admin/orders",
    tags=["Admin Orders"]
)


def build_order_response(order):
    items = []

    for item in order.items:
        subtotal = item.price * item.quantity

        items.append(
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product_name,
                price=item.price,
                quantity=item.quantity,
                subtotal=subtotal
            )
        )

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=items
    )


@router.get("", response_model=OrderListResponse)
def get_all_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin)
):
    query = (
        db.query(Order)
        .order_by(Order.created_at.desc())
    )

    total = query.count()

    total_pages = ceil(total / limit) if total > 0 else 0

    orders = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": [
            build_order_response(order)
            for order in orders
        ],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }