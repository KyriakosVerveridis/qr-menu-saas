import { createPortal } from 'react-dom';

export default function StoreSelectorModal({ isOpen, onClose, stores, selectedId, onSelect }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-xl">
              🏪
            </div>
            <h2 className="text-xl font-bold text-slate-900">Επιλέξτε Κατάστημα</h2>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto mb-4">
            {stores.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-6">Δεν υπάρχουν ακόμα καταστήματα.</p>
            )}
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => { onSelect(store.id); onClose(); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  String(selectedId) === String(store.id)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Άκυρο
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}