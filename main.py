from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routes.auth_routes import router as auth_router
from routes.product_routes import router as product_router
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.payment_routes import router as payment_router
from routes.admin_order_routes import router as admin_order_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Digital Product Store API",
    description="Full-stack Digital Product Store Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(admin_order_router)


@app.get("/")
def home():
    return {
        "message": "Digital Product Store API is working!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }