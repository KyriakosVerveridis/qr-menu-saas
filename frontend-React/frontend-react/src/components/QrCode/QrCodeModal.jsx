import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose, qrCodeUrl }) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-menu.png';
    link.click();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-sm my-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex-1">QR Κωδικός Μενού</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
          </div>

          {qrCodeUrl ? (
            <>
              <img src={qrCodeUrl} alt="QR Code καταστήματος" className="w-56 h-56 mx-auto rounded-xl border border-slate-200" />

              <button
                onClick={handleDownload}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Download size={18} />
                Λήψη QR
              </button>
            </>
          ) : (
            <p className="text-slate-400 text-sm py-8">Επίλεξε πρώτα ένα κατάστημα.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}