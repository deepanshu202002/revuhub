export default function Sidebar({ categories, active, onSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-700 text-gray-200">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Categories
      </div>
      <ul className="mt-4">
        <li>
          <button
            className={`w-full text-left px-5 py-3 mb-1 rounded-lg flex items-center transition
                        ${
                          !active
                            ? "bg-indigo-600 text-white font-semibold"
                            : "hover:bg-gray-800"
                        }`}
            onClick={() => onSelect(null)}
          >
            All
          </button>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <button
              className={`w-full text-left px-5 py-3 mb-1 rounded-lg flex items-center transition
                          ${
                            active === c
                              ? "bg-indigo-600 text-white font-semibold"
                              : "hover:bg-gray-800"
                          }`}
              onClick={() => onSelect(c)}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
