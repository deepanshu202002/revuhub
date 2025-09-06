import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import { api } from "../api";

function Home() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [products, setProducts] = useState([]);

  const load = async () => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);

    const data = await api(`/api/products?${params.toString()}`);
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, [cat]);

  const categories = [
    "Mobiles",
    "Gaming",
    "Camera",
    "Monitors",
    "Laptops",
    "Books",
    "Smart Watches",
    "Cars",
    "Bikes",
    "Clothing Brands",
  ];

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Navbar
        onSearch={(q) => {
          setQuery(q);
          setTimeout(load, 0);
        }}
      />

      {/* Main layout */}
      <div className="flex flex-1">
        {/* Sidebar with fixed width */}
        <div className="w-64 border-r border-gray-800">
          <Sidebar categories={categories} active={cat} onSelect={setCat} />
        </div>

        {/* Product Grid / Empty State */}
        <main className="flex-1 p-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-min">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <h2 className="text-lg font-semibold mb-2">No Products Found</h2>
              <p className="text-sm">
                We currently don’t have any products in this category.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
