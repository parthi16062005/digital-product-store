from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, Cart, CartItem, Product, Order, OrderItem
from schemas import OrderResponse, OrderListResponse, OrderItemResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# =========================
# Helper: Convert Order
# =========================

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


# =========================
# Create Order
# =========================

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_order(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    total_amount = 0
    order_items = []

    for cart_item in cart.items:

        product = (
            db.query(Product)
            .filter(
                Product.id == cart_item.product_id,
                Product.is_active == True
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or inactive"
            )

        subtotal = product.price * cart_item.quantity
        total_amount += subtotal

        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            price=product.price,
            quantity=cart_item.quantity
        )

        order_items.append(order_item)

    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="PENDING"
    )

    db.add(order)
    db.flush()

    for order_item in order_items:
        order_item.order_id = order.id
        db.add(order_item)

    # Clear cart after creating order
    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete()

    db.commit()
    db.refresh(order)

    return build_order_response(order)


# =========================
# Get My Orders
# =========================

@router.get(
    "",
    response_model=OrderListResponse
)
def get_my_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
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


# =========================
# Get Order by ID
# =========================

@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return build_order_response(order)