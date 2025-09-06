import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api, signPresignedBatch } from "../api";
import { useAuth } from "../context/AuthContext";

export default function CreateReview() {
  const { user } = useAuth();
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const [productId, setProductId] = useState(params.get("productId") || "");
  const [products, setProducts] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api("/api/products").then(setProducts);
  }, []);

  const handleSubmit = async () => {
    try {
      setUploading(true);
      // request batch presigned URLs
      const fileMeta = Array.from(files).map((f) => ({ filetype: f.type }));
      const { items } = await signPresignedBatch({
        type: "review",
        files: fileMeta,
        token: user.token,
      });

      // PUT each file to S3
      await Promise.all(
        items.map((it, idx) =>
          fetch(it.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": files[idx].type },
            body: files[idx],
          })
        )
      );
      const imageUrls = items.map((i) => i.fileUrl);

      // create review with imageUrls
      await api("/api/reviews", {
        method: "POST",
        token: user.token,
        body: { productId, text, imageUrls },
      });

      alert("Review submitted for approval!");
      nav(`/product/${productId}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Create Review</h1>
        <label className="block mb-2">Product</label>
        <select
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select a product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="block mb-2">Your Review</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 mb-4"
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts…"
        />

        <label className="block mb-2">Upload Images (multiple)</label>
        <div className="flex gap-2 mb-2">
          {files &&
            Array.from(files).map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Review ${index + 1}`}
                className="w-20 h-20 border object-cover"
              />
            ))}
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
        />

        <button
          disabled={!productId || !text || !files.length || uploading}
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Submit for approval"}
        </button>
      </div>
    </>
  );
}
