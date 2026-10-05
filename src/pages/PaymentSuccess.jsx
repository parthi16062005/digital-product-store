import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>

        <p className="text-gray-600 mb-6">
          Your payment was completed successfully.
        </p>

        <Link
          to="/orders"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;