import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import PublishModal from '../Publish/PublishModal';
import { QrCode,LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function TopHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { clearRestaurant, restaurantId } = useRestaurant();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    if (!restaurantId) {
      setHasSubscription(null);
      setRestaurantName('');
      return;
    }
    axios.get(`${API_URL}/api/billing/subscription-status/?restaurant_id=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setHasSubscription(res.data.has_subscription))
      .catch(() => setHasSubscription(false));

    axios.get(`${API_URL}/api/restaurants/${restaurantId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setRestaurantName(res.data.name))
      .catch(() => setRestaurantName(''));
  }, [restaurantId]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    clearRestaurant();
    navigate('/login');
  };

    return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-4 md:px-6 py-4">
      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
        <QrCode size={22} />
      </div>

      <div className="flex items-center gap-2">
        {restaurantId && hasSubscription !== null && (
          <button
            onClick={() => setShowPublishModal(true)}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
              hasSubscription
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <span className="text-base">{restaurantName}</span>
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="text-slate-600 hover:text-red-600 transition-colors"
      >
        <LogOut size={20} />
      </button>

      <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} />
    </div>
  );
}