import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [payingOrder, setPayingOrder] = useState(null);

  const token = localStorage.getItem("access_token");

  const limit = 3;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        toast.error("Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          "http://127.0.0.1:8000/orders",
          {
            params: {
              page: page,
              limit: limit,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching orders:", error);

        toast.error(
          error.response?.data?.detail ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, token]);

  const handlePayment = async (orderId) => {
    setPayingOrder(orderId);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/payments/create-checkout-session",
        {
          order_id: orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error("Payment error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to start payment."
      );
    } finally {
      setPayingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              You have no orders.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Order #{order.id}
                      </h2>

                      <p className="text-gray-600 mt-2">
                        Date:{" "}
                        {new Date(
                          order.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-4 py-2 rounded-md font-medium ${
                          order.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : order.status === "CANCELLED"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-3"
                      >
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {item.product_name}
                          </h3>

                          <p className="text-gray-600 text-sm">
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-gray-800">
                          ₹{item.subtotal}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <span className="text-lg font-semibold text-gray-800">
                        Total
                      </span>

                      <span className="text-xl font-bold text-blue-600 ml-3">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    {order.status === "PENDING" && (
                      <button
                        onClick={() =>
                          handlePayment(order.id)
                        }
                        disabled={
                          payingOrder === order.id
                        }
                        className="bg-green-600 text-white px-5 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {payingOrder === order.id
                          ? "Starting Payment..."
                          : "Pay Now"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() =>
                    setPage(pageNumber)
                  }
                  className={`px-4 py-2 rounded-md ${
                    page === pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;