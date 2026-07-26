import { createPortal } from 'react-dom';

export default function QrCodeModal({ isOpen, onClose, qrCodeUrl }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-sm my-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4">QR Κωδικός Μενού</h2>

          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code καταστήματος" className="w-56 h-56 mx-auto rounded-xl border border-slate-200" />
          ) : (
            <p className="text-slate-400 text-sm py-8">Επίλεξε πρώτα ένα κατάστημα.</p>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 bg-slate-100 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Άκυρο
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}