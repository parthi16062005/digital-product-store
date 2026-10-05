import { Link } from "react-router-dom";

function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-6">
          Your payment was cancelled.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            View My Orders
          </Link>

          <Link
            to="/products"
            className="bg-gray-600 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;