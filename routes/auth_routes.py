
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session

from database import get_db
from models import User, Cart
from schemas import UserRegister, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token
from dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="USER"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create an empty cart for the new user
    cart = Cart(user_id=new_user.id)

    db.add(cart)
    db.commit()

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # OAuth2 uses the field name "username".
    # We use the user's email as the username.
    user = (
        db.query(User)
        .filter(User.email == username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
