import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, signPresignedBatch } from "../api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ProductPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const p = await api(`/api/products/${id}`);
    setProduct(p);
    const r = await api(`/api/reviews?productId=${id}`);
    setReviews(r);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const fileMeta = Array.from(files).map((f) => ({ filetype: f.type }));
      const { items } = await signPresignedBatch({
        type: "review",
        files: fileMeta,
        token: user.token,
      });

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

      await api("/api/reviews", {
        method: "POST",
        token: user.token,
        body: { productId: id, text, imageUrls },
      });

      alert("Review submitted for approval!");
      setShowReviewModal(false);
      setText("");
      setFiles([]);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* PRODUCT SECTION */}
        {product && (
          <div className="mb-10 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 mt-1 font-medium">{product.category}</p>
            {product.images?.[0] && (
              <img
                className="mt-4 rounded-xl shadow-lg cursor-pointer max-h-[400px] object-contain mx-auto transition-transform hover:scale-105"
                src={product.images[0]}
                alt={product.name}
              />
            )}
          </div>
        )}

        {/* REVIEWS HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Customer Reviews
          </h2>
          {user?.token && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2 rounded-full bg-gray-700 text-white font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
            >
              Write a review
            </button>
          )}

          {!user?.token && (
            <h2 className="text-gray-700 mb-3 leading-relaxed">
              Please SignIn To Write Reviews
            </h2>
          )}
        </div>

        {/* REVIEWS LIST */}
        <div className="space-y-5">
          {reviews.map((rv) => (
            <div
              key={rv._id}
              className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3 bg-gray-100 px-3 py-2 rounded-lg">
                <img
                  src={rv.user?.picture}
                  className="w-10 h-10 rounded-full border"
                  alt={rv.user?.name}
                />
                <div className="font-medium text-gray-900">{rv.user?.name}</div>
                {/* <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-300 text-gray-800">
                  {rv.status}
                </span> */}
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{rv.text}</p>

              {rv.imageUrls?.length ? (
                <div className="flex flex-wrap gap-3">
                  {rv.imageUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt="review"
                      className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition"
                      onClick={() => setPopupImage(u)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* POPUP IMAGE MODAL */}
      {popupImage && (
        <div
          className="fixed inset-0  flex items-center  bg-black/20 justify-center z-50 backdrop-blur-sm"
          onClick={() => setPopupImage(null)}
        >
          <img
            src={popupImage}
            alt="popup"
            className="max-w-[50%] max-h-[50%] rounded-xl shadow-xl"
          />
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white/90 rounded-2xl w-full max-w-xl p-8 relative shadow-2xl backdrop-blur-sm">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-2xl"
              onClick={() => setShowReviewModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Review {product?.name}
            </h2>

            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts..."
            />

            <label className="block mb-2 text-gray-600 font-medium">
              Upload Images (multiple)
            </label>
            <div className="flex gap-2 mb-4 flex-wrap">
              {files &&
                Array.from(files).map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 border rounded-lg object-cover shadow-md"
                  />
                ))}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="mb-4"
            />

            <button
              disabled={!text || uploading}
              onClick={handleSubmit}
              className="w-full px-5 py-3 rounded-full bg-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Submit for approval"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
