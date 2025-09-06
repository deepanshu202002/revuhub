import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api, signPresignedSingle } from "../api";
import { useAuth } from "../context/AuthContext";
export default function AdminPage() {
  // Product creation state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  // Review management state
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("in-progress");

  // Load reviews from backend
  const loadReviews = async () => {
    const data = await api("/api/reviews/admin");
    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const approveReview = async (id) => {
    await api(`/api/reviews/${id}/approve`, {
      method: "POST",
      token: user.token,
    });
    loadReviews();
  };

  const declineReview = async (id) => {
    await api(`/api/reviews/${id}/decline`, {
      method: "POST",
      token: user.token,
    });
    loadReviews();
  };

  // Product creation
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleCreateProduct = async () => {
    if (!name || !category || !file) return alert("All fields are required");

    try {
      setUploading(true);

      // 1️⃣ Get presigned URL from backend
      const { uploadUrl, fileUrl } = await signPresignedSingle({
        file,
        type: "product",
        token: user.token,
      });

      // 2️⃣ Upload image directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3️⃣ Send request to backend to create product with imageUrl
      await api("/api/products", {
        method: "POST",
        body: { name, category, images: [fileUrl] },
        token: user.token,
      });

      alert("✅ Product created successfully!");
      setName("");
      setCategory("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setUploading(false);
    }
  };

  // Filtered reviews by tab
  const filteredReviews = reviews.filter((r) => r.status === activeTab);

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
    <>
      <Navbar />
      <div className="w-full px-4 py-6 space-y-8">
        {/* Product Creation */}
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <input
            className="border px-3 py-2 rounded w-full mb-3"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded w-full mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {file && (
            <img
              src={file ? URL.createObjectURL(file) : null}
              alt="Profile"
              className="w-20 h-20  border object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-3"
          />
          <button
            onClick={handleCreateProduct}
            disabled={uploading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {uploading ? "Processing…" : "Create Product"}
          </button>
        </div>

        {/* Review Management */}
        <div className="w-full">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 justify-center">
            {["in-progress", "approved", "declined"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-4 w-full">
            {filteredReviews.length === 0 ? (
              <p className="text-gray-500 text-center">
                No {activeTab} reviews.
              </p>
            ) : (
              filteredReviews.map((rv) => (
                <div
                  key={rv._id}
                  className="p-4 border rounded-xl bg-gray-50 w-full flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rv.user?.picture}
                      alt={rv.user?.name}
                      className="w-10 h-10 rounded-full border"
                    />
                    <p className="font-medium">{rv.user?.name}</p>
                    <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-200">
                      {rv.status}
                    </span>
                  </div>

                  <p className="text-gray-700">{rv.text}</p>

                  {/* Review Images */}
                  {rv.imageUrls?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {rv.imageUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="review"
                          className="rounded-lg max-h-48 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Approve/Decline Buttons only for pending */}
                  {rv.status === "in-progress" && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => approveReview(rv._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => declineReview(rv._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
