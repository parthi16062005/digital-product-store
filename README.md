# Digital Product Store

A full-stack Digital Product Store application built using FastAPI, React, SQLAlchemy, SQLite, JWT authentication, and Stripe Checkout integration.

## Features

### Authentication
- User registration
- User login
- JWT authentication
- Protected APIs
- User profile API
- Admin and normal user roles

### Products
- View products
- Search products
- Product pagination
- Product details
- Admin product creation
- Admin product update
- Admin product deletion

### Cart
- Add products to cart
- Update quantity
- Remove cart items
- Clear cart
- View cart total

### Orders
- Create order from cart
- View user's orders
- View order details
- Order pagination
- Admin can view all orders

### Stripe Payment
- Stripe Checkout integration
- Checkout session creation
- Stripe webhook integration
- Payment status tracking
- Order status updates
- PENDING, PAID, FAILED and CANCELLED statuses

### Database

The application uses SQLAlchemy ORM with the following tables:

- Users
- Products
- Carts
- Cart Items
- Orders
- Order Items
- Payments

### SQL Reports

The project contains SQL reports for:

- Sales by product
- Orders by user
- Order and payment status

## Technologies Used

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT
- Passlib
- Stripe
- Pytest

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- React Toastify

## Project Structure

digital-product-store/
│
├── backend/
│   ├── routes/
│   ├── reports/
│   ├── tests/
│   ├── auth.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│   ├── create_admin.py
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore

## Backend Setup

Open PowerShell and go to the backend folder:

cd "C:\Users\parth\OneDrive\Desktop\digital-product-store\backend"

Activate the backend virtual environment:

.\venv\Scripts\Activate.ps1

Install the required packages:

pip install -r requirements.txt

Create the .env file using .env.example as the template.

Start the FastAPI server:

python -m uvicorn main:app --reload

Backend URL:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

## Admin User

Run:

python create_admin.py

Admin credentials:

Email: admin@example.com
Password: admin123

## Normal User

Normal user credentials:

Email: kumar@example.com
Password: password123

## Frontend Setup

Open another PowerShell terminal.

Go to the frontend folder:

cd "C:\Users\parth\OneDrive\Desktop\digital-product-store\frontend"

Install dependencies:

npm install

Start the React application:

npm run dev

Frontend URL:

http://localhost:5173

## Frontend Pages

/login
/register
/products
/products/:productId
/cart
/orders
/payment-success
/payment-cancel
/admin/products
/admin/orders

## Authentication

The application uses JWT Bearer authentication.

Protected API requests use:

Authorization: Bearer <access_token>

## Stripe Payment Flow

The payment flow is:

React Cart
    ↓
Create Order
    ↓
Order status = PENDING
    ↓
Click Pay Now
    ↓
FastAPI creates Stripe Checkout Session
    ↓
Stripe Checkout
    ↓
Customer completes payment
    ↓
Stripe Webhook
    ↓
FastAPI verifies webhook
    ↓
Payment status = PAID
    ↓
Order status = PAID

## Stripe Environment Variables

Create a .env file inside the backend folder.

STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

Do not upload the real .env file to GitHub.

Use .env.example for the required variable names.

## Stripe Testing Note

Stripe Checkout and webhook integration have been implemented.

The application supports Stripe test mode when valid Stripe test credentials are provided.

If Stripe credentials are not configured, the application will not fake a successful payment or mark an order as PAID.

Payment status is intended to be updated through the Stripe payment and webhook flow.

## Testing

Run backend tests from the backend folder:

python -m pytest -v

The project includes automated tests for:

- User registration
- User login
- Invalid login
- Product creation
- Product listing
- Product pagination
- Cart functionality
- Order functionality
- Payment functionality
- Unauthorized access

## SQL Reports

The backend contains SQL reports for:

backend/reports/sales_by_product.sql
backend/reports/orders_by_user.sql
backend/reports/order_payment_status.sql

## Security

- Passwords are hashed before storage.
- JWT authentication protects private APIs.
- Admin APIs require ADMIN role.
- Users can access only their own cart.
- Users can access only their own orders.
- Stripe webhook signatures are verified.
- Stripe secret keys are stored in environment variables.

## Running the Complete Application

### Backend

cd "C:\Users\parth\OneDrive\Desktop\digital-product-store\backend"

.\venv\Scripts\Activate.ps1

python -m uvicorn main:app --reload

### Frontend

Open another terminal:

cd "C:\Users\parth\OneDrive\Desktop\digital-product-store\frontend"

npm run dev

Then open:

http://localhost:5173

## Project Status

The main full-stack functionality has been implemented and tested.

Implemented:

- User registration
- User login
- JWT authentication
- Role-based authorization
- Product CRUD
- Product search
- Product pagination
- Cart management
- Order management
- Admin product management
- Admin order management
- Stripe Checkout integration
- Stripe webhook handling
- Payment status tracking
- SQL reports
- Automated backend tests
- React frontend
- Tailwind CSS
- React Router
- Axios
- React Toastify

## Test Results

Backend automated tests:

9 tests passed.

Command used:

python -m pytest -v

Result:

9 passed

## Important Note

The Stripe payment integration is implemented using Stripe Checkout and webhook handling.

A real PAID status requires valid Stripe test credentials and a successful Stripe test payment. The application does not artificially change PENDING orders to PAID.