import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="block bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-md 
                 hover:shadow-lg transform hover:-translate-y-0.5 transition w-52 h-64"
    >
      <div className="w-full h-36 rounded-lg bg-gray-700 mb-3 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            className="w-full h-full object-cover rounded-lg"
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="font-semibold text-gray-100 text-base mb-1 truncate">
        {product.name}
      </div>
      <div className="text-sm text-gray-400 truncate">{product.category}</div>
    </Link>
  );
}
