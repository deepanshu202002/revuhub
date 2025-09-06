import { Link, useNavigate } from "react-router-dom";
import { useAuth, GoogleButton } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const nav = useNavigate();
  console.log(user);
  return (
    <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link
          to="/"
          className="text-2xl font-bold text-gray-100 hover:text-white transition"
        >
          RevuHub
        </Link>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <input
            className="w-full rounded-full bg-gray-800 text-gray-200 placeholder-gray-400 
                       px-5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.(query)}
          />
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white font-medium
                       hover:bg-indigo-500 transition"
            onClick={() => onSearch?.(query)}
          >
            Search
          </button>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            {/* Admin button only if role === "admin" */}
            {user.user?.role === "admin" && (
              <button
                onClick={() => nav("/admin")}
                className="px-3 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
              >
                Admin
              </button>
            )}

            {/* My Reviews button */}
            <button
              onClick={() => nav("/my-reviews")}
              className="px-3 py-2 rounded-md bg-gray-800 text-gray-200 font-medium hover:bg-gray-700 transition"
            >
              My Reviews
            </button>

            <img
              src={user.user?.picture}
              className="w-10 h-10 rounded-full border-2 border-gray-600 shadow"
              alt="User"
            />
            <button
              onClick={() => nav("/profile")}
              className="text-gray-200 font-medium hover:text-white transition"
            >
              {user.user?.name || "Profile"}
            </button>
            <button
              onClick={logout}
              className="text-red-400 hover:text-red-500 font-medium transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <GoogleButton />
        )}
      </div>
    </div>
  );
}
