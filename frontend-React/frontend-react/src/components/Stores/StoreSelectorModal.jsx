import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Store } from 'lucide-react';

export default function StoreSelectorModal({ isOpen, onClose, stores, selectedId, onSelect }) {
  const [tempSelected, setTempSelected] = useState(selectedId);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl mx-auto mb-3 flex items-center justify-center text-emerald-600">
                <Store size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Επιλέξτε Κατάστημα</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto mb-4">
            {stores.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-6">Δεν υπάρχουν ακόμα καταστήματα.</p>
            )}
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => setTempSelected(store.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  String(tempSelected) === String(store.id)
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                    : 'text-slate-700 hover:bg-slate-50 border-2 border-transparent'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!tempSelected}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Επιλογή
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}