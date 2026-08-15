import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UpgradeButton from './UpgradeButton';
import ManageSubscriptionButton from './ManageSubscriptionButton';

const API_URL = import.meta.env.VITE_API_URL;

export default function UpgradeModal({ isOpen, onClose, restaurantId }) {
  const [hasSubscription, setHasSubscription] = useState(null);

  useEffect(() => {
    if (!isOpen || !restaurantId) return;

    axios.get(`${API_URL}/api/billing/subscription-status/?restaurant_id=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setHasSubscription(res.data.has_subscription))
      .catch(() => setHasSubscription(false));
  }, [isOpen, restaurantId]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {hasSubscription ? 'Η Συνδρομή σας' : 'Αναβάθμιση σε Premium'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        {hasSubscription === null ? (
          <p className="text-sm text-slate-500">Φόρτωση...</p>
        ) : hasSubscription ? (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Έχετε ήδη ενεργή συνδρομή Premium.
            </p>
            <ManageSubscriptionButton restaurantId={restaurantId} />
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Πολλαπλά καταστήματα, πολυγλωσσικό μενού, και περισσότερα.
            </p>
            <UpgradeButton restaurantId={restaurantId} />
          </>
        )}
      </div>
    </div>,
    document.body
  );
}