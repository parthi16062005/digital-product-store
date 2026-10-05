import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access_token");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/products",
        {
          params: {
            page: 1,
            limit: 100,
          },
        }
      );

      setProducts(response.data.items);
    } catch (error) {
      console.error("Error fetching products:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load products."
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

    fetchProducts();
  }, []);

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please login first.");
      return;
    }

    try {
      const productData = {
        name: name,
        description: description,
        price: Number(price),
        image_url: imageUrl || null,
      };

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/products/${editingId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Product updated successfully!");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/products",
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Product created successfully!");
      }

      clearForm();
      fetchProducts();
    } catch (error) {
      console.error("Product save error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to save product."
      );
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price);
    setImageUrl(product.image_url || "");
  };

  const handleDelete = async (productId) => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product deleted successfully!");

      fetchProducts();
    } catch (error) {
      console.error("Product delete error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to delete product."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Product Management
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingId
              ? "Edit Product"
              : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter product description"
                rows="4"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Enter price"
                min="1"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>

              <input
                type="url"
                value={imageUrl}
                onChange={(event) =>
                  setImageUrl(event.target.value)
                }
                placeholder="Enter image URL"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
              >
                {editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Products
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-600">
              No products found.
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-md p-5"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {product.name}
                      </h3>

                      <p className="text-gray-600 mt-2">
                        {product.description}
                      </p>

                      <p className="text-blue-600 font-bold mt-2">
                        ₹{product.price}
                      </p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <button
                        onClick={() =>
                          handleEdit(product)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(product.id)
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;