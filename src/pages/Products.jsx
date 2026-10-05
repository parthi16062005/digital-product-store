import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 3;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/products",
          {
            params: {
              page: page,
              limit: limit,
              search: search,
            },
          }
        );

        setProducts(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Digital Product Store
        </h1>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            Products
          </h2>

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              No products found.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >

                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-6">

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {product.description}
                    </p>

                    <p className="text-lg font-bold text-blue-600 mb-4">
                      ₹{product.price}
                    </p>

                    <Link
                      to={"/products/" + product.id}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700"
                    >
                      View Product
                    </Link>

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
                  onClick={() => setPage(pageNumber)}
                  className={
                    page === pageNumber
                      ? "px-4 py-2 rounded-md bg-blue-600 text-white"
                      : "px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  }
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

export default Products;