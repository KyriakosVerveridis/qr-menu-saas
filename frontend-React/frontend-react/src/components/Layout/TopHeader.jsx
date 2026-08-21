import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import PublishModal from '../Publish/PublishModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function TopHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { clearRestaurant, restaurantId } = useRestaurant();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (!restaurantId) {
      setHasSubscription(null);
      return;
    }
    axios.get(`${API_URL}/api/billing/subscription-status/?restaurant_id=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setHasSubscription(res.data.has_subscription))
      .catch(() => setHasSubscription(false));
  }, [restaurantId]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    clearRestaurant();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-4 md:px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:text-slate-900 text-2xl leading-none"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-slate-900">My App</h1>

        {restaurantId && hasSubscription !== null && (
          <button
            onClick={() => setShowPublishModal(true)}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
              hasSubscription
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {hasSubscription ? '🟢 Live' : '⚪ Ανενεργό'}
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
      >
        Αποσύνδεση
      </button>

      <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} />
    </div>
  );
}