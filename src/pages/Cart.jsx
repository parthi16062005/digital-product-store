import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const token = localStorage.getItem("access_token");

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first.");
      setLoading(false);
      return;
    }

    fetchCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/cart/items/${itemId}`,
        {
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data);

      toast.success("Quantity updated!");
    } catch (error) {
      console.error("Update cart error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to update quantity."
      );
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/cart/items/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Item removed!");

      fetchCart();
    } catch (error) {
      console.error("Remove item error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to remove item."
      );
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(
        "http://127.0.0.1:8000/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Cart cleared!");

      fetchCart();
    } catch (error) {
      console.error("Clear cart error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to clear cart."
      );
    }
  };

  const placeOrder = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/orders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `Order #${response.data.id} created successfully!`
      );

      fetchCart();
    } catch (error) {
      console.error("Place order error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading cart...
        </p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Unable to load cart.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              Your cart is empty.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.product_name}
                    </h2>

                    <p className="text-gray-600 mt-2">
                      Price: ₹{item.price}
                    </p>

                    <p className="text-gray-600 mt-1">
                      Subtotal: ₹{item.subtotal}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="font-semibold text-lg">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-800">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{cart.total_amount}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {placingOrder
                    ? "Placing Order..."
                    : "Place Order"}
                </button>

                <button
                  onClick={clearCart}
                  className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;