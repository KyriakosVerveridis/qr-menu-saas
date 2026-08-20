import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = window.location.origin;

export default function PhonePreview() {
  const { restaurantId } = useRestaurant();
  const [slug, setSlug] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!restaurantId) {
      setSlug(null);
      return;
    }
    axios.get(`${API_URL}/api/restaurants/${restaurantId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setSlug(res.data.slug))
      .catch(() => setSlug(null));
  }, [restaurantId]);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [slug]);

  if (!restaurantId) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 p-6 text-center">
        Επίλεξε κατάστημα για προεπισκόπηση
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="relative w-[280px] max-h-[85vh] aspect-[9/19] bg-black rounded-[2.5rem] p-3 shadow-xl">
        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
          {slug && (
            <iframe
              key={refreshKey}
              src={`${FRONTEND_URL}/menu/${slug}`}
              title="Menu Preview"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}