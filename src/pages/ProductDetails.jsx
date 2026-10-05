import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/products/${productId}`
        );

        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);

        toast.error(
          error.response?.data?.detail ||
            "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login first.");
      return;
    }

    setAddingToCart(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/cart/items",
        {
          product_id: product.id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">
          Product not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/products"
          className="inline-block text-blue-600 hover:underline mb-6"
        >
          Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            {product.description}
          </p>

          <p className="text-2xl font-bold text-blue-600 mb-6">
            ₹{product.price}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-medium text-gray-700">
              Quantity:
            </span>

            <button
              onClick={() =>
                setQuantity(Math.max(1, quantity - 1))
              }
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              -
            </button>

            <span className="font-semibold text-lg">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              +
            </button>
          </div>

          <p className="text-lg font-semibold text-gray-800 mb-6">
            Total: ₹{product.price * quantity}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {addingToCart
              ? "Adding..."
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;