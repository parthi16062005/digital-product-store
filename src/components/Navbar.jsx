import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setUser(null);

    toast.success("Logged out successfully!");

    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <Link
          to="/products"
          className="text-xl font-bold text-gray-800"
        >
          Digital Product Store
        </Link>

        <div className="flex items-center gap-5 flex-wrap">

          <Link
            to="/products"
            className="text-gray-700 hover:text-blue-600"
          >
            Products
          </Link>

          {user && user.role !== "ADMIN" && (
            <>
              <Link
                to="/cart"
                className="text-gray-700 hover:text-blue-600"
              >
                Cart
              </Link>

              <Link
                to="/orders"
                className="text-gray-700 hover:text-blue-600"
              >
                Orders
              </Link>
            </>
          )}

          {user && user.role === "ADMIN" && (
            <>
              <Link
                to="/admin/products"
                className="text-gray-700 hover:text-blue-600"
              >
                Admin Products
              </Link>

              <Link
                to="/admin/orders"
                className="text-gray-700 hover:text-blue-600"
              >
                Admin Orders
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;