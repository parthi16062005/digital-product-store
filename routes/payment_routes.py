import os

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User, Order, Payment
from schemas import CheckoutSessionRequest


load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

STRIPE_WEBHOOK_SECRET = os.getenv(
    "STRIPE_WEBHOOK_SECRET"
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# =========================
# Create Stripe Checkout
# =========================

@router.post("/create-checkout-session")
def create_checkout_session(
    payment_data: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check Stripe Secret Key
    if (
        not stripe.api_key
        or stripe.api_key == "your_stripe_secret_key_here"
    ):
        raise HTTPException(
            status_code=400,
            detail="Stripe secret key is not configured"
        )

    # Find user's order
    order = (
        db.query(Order)
        .filter(
            Order.id == payment_data.order_id,
            Order.user_id == current_user.id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Only pending orders can be paid
    if order.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Order is not available for payment"
        )

    # Check if payment already exists
    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id
        )
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment session already exists for this order"
        )

    # Create Stripe line items
    line_items = []

    for item in order.items:

        line_items.append({
            "price_data": {
                "currency": "inr",
                "product_data": {
                    "name": item.product_name
                },
                "unit_amount": int(
                    round(item.price * 100)
                )
            },
            "quantity": item.quantity
        })

    # Create Stripe Checkout Session
    try:

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",

            success_url=(
                "http://localhost:5173/payment-success"
                "?session_id={CHECKOUT_SESSION_ID}"
            ),

            cancel_url=(
                "http://localhost:5173/payment-cancel"
            ),

            metadata={
                "order_id": str(order.id),
                "user_id": str(current_user.id)
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Stripe error: {str(e)}"
        )

    # Save payment in database
    payment = Payment(
        order_id=order.id,
        stripe_session_id=checkout_session.id,
        stripe_payment_intent_id=None,
        status="PENDING",
        amount=order.total_amount
    )

    db.add(payment)
    db.commit()

    return {
        "message": "Checkout session created successfully",
        "order_id": order.id,
        "session_id": checkout_session.id,
        "checkout_url": checkout_session.url,
        "payment_status": "PENDING"
    }


# =========================
# Payment Status
# =========================

@router.get("/{order_id}")
def get_payment_status(
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
            status_code=404,
            detail="Order not found"
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id
        )
        .first()
    )

    if not payment:
        return {
            "order_id": order.id,
            "payment_status": "PENDING",
            "amount": order.total_amount
        }

    return {
        "order_id": order.id,
        "payment_status": payment.status,
        "amount": payment.amount
    }


# =========================
# Stripe Webhook
# =========================

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    payload = await request.body()

    signature = request.headers.get(
        "stripe-signature"
    )

    if not signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Stripe signature"
        )

    if (
        not STRIPE_WEBHOOK_SECRET
        or STRIPE_WEBHOOK_SECRET == "temporary"
    ):
        raise HTTPException(
            status_code=400,
            detail="Stripe webhook secret is not configured"
        )

    # Verify Stripe webhook
    try:

        event = stripe.Webhook.construct_event(
            payload,
            signature,
            STRIPE_WEBHOOK_SECRET
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid webhook payload"
        )

    except stripe.error.SignatureVerificationError:

        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature"
        )

    event_type = event["type"]
    event_data = event["data"]["object"]


    # =========================
    # Payment Successful
    # =========================

    if event_type == "checkout.session.completed":

        session_id = event_data.get("id")

        payment = (
            db.query(Payment)
            .filter(
                Payment.stripe_session_id == session_id
            )
            .first()
        )

        if payment:

            payment.status = "PAID"

            payment.stripe_payment_intent_id = (
                event_data.get("payment_intent")
            )

            order = (
                db.query(Order)
                .filter(
                    Order.id == payment.order_id
                )
                .first()
            )

            if order:
                order.status = "PAID"

            db.commit()


    # =========================
    # Checkout Expired
    # =========================

    elif event_type == "checkout.session.expired":

        session_id = event_data.get("id")

        payment = (
            db.query(Payment)
            .filter(
                Payment.stripe_session_id == session_id
            )
            .first()
        )

        if payment:

            payment.status = "CANCELLED"

            order = (
                db.query(Order)
                .filter(
                    Order.id == payment.order_id
                )
                .first()
            )

            if order:
                order.status = "CANCELLED"

            db.commit()


    # =========================
    # Payment Failed
    # =========================

    elif event_type == "payment_intent.payment_failed":

        payment_intent_id = event_data.get("id")

        payment = (
            db.query(Payment)
            .filter(
                Payment.stripe_payment_intent_id
                == payment_intent_id
            )
            .first()
        )

        if payment:

            payment.status = "FAILED"

            order = (
                db.query(Order)
                .filter(
                    Order.id == payment.order_id
                )
                .first()
            )

            if order:
                order.status = "FAILED"

            db.commit()


    return {
        "message": "Webhook received successfully"
    }