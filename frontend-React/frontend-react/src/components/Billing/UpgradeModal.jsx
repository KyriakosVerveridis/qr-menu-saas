import { createPortal } from 'react-dom';
import UpgradeButton from './UpgradeButton';

export default function UpgradeModal({ isOpen, onClose, restaurantId }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Αναβάθμιση σε Premium</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Πολλαπλά καταστήματα, πολυγλωσσικό μενού, και περισσότερα.
        </p>

        <UpgradeButton restaurantId={restaurantId} />
      </div>
    </div>,
    document.body
  );
}