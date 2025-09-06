import { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const load = async () => {
    console.log("token from my review page", user.token);
    const data = await api("/api/reviews/me", {
      token: user.token,
    });
    setReviews(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-5">My Reviews</h2>
        <div className="space-y-4">
          {reviews.map((rv) => (
            <div
              key={rv._id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{rv.product?.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    rv.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : rv.status === "declined"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {rv.status}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{rv.text}</p>
              {rv.imageUrls?.length ? (
                <div className="flex gap-2">
                  {rv.imageUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt="review"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
