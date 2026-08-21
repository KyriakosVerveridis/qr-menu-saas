const allergenEmojis = {
  gluten: '🌾', crustaceans: '🦐', eggs: '🥚', fish: '🐟',
  peanuts: '🥜', soybeans: '🫘', milk: '🥛', nuts: '🌰',
  celery: '🥬', mustard: '🟡', sesame: '⚪', sulphites: '🍷',
  lupin: '🫛', molluscs: '🦪',
};

export default function ProductDetailSheet({ product, translation, categoryName, isDark, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)' }}
        className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-[28px] ${
          isDark ? 'bg-neutral-900 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 pointer-events-none">
          <div className={`w-9 h-1 rounded-full ${isDark ? 'bg-neutral-600' : 'bg-gray-300'}`} />
        </div>

        <button
          onClick={onClose}
          aria-label="Κλείσιμο"
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-base font-medium transition-colors ${
            isDark ? 'bg-neutral-800 text-gray-300 hover:bg-neutral-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ×
        </button>

        {product.image && (
          <div className="w-full h-52 bg-gray-200">
            <img
              src={product.image}
              alt={translation.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-5 pt-4 pb-6">
          <h2 className="text-xl font-bold leading-snug">{translation.name}</h2>

          <span className={`block text-lg font-bold mt-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            {product.price}€
          </span>

          {translation.description && (
            <p className={`text-sm leading-relaxed mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {translation.description}
            </p>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div className="mt-4">
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Αλλεργιογόνα
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map(a => (
                  <span
                    key={a.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                      isDark ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {allergenEmojis[a.code] || ''} {a.name_el}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}