import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import CreateStore from '../CreateStore/CreateStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function Sidebar() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const { restaurantId, updateRestaurant } = useRestaurant();
  const navigate = useNavigate();

  const fetchStores = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      setStores(res.data);
      setError('');
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError('Δεν ήταν δυνατή η φόρτωση των καταστημάτων.');
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (!restaurantId) {
      setQrCodeUrl(null);
      return;
    }

    let objectUrl;
    axios.get(`${API_URL}/api/restaurants/${restaurantId}/qr-code/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
      responseType: 'blob',
    })
    .then(res => {
      objectUrl = URL.createObjectURL(res.data);
      setQrCodeUrl(objectUrl);
    })
    .catch(err => {
      console.error("Error fetching QR code:", err);
      setQrCodeUrl(null);
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [restaurantId]);

  const handleSelect = (e) => {
    const id = e.target.value;
    if (!id) return;
    updateRestaurant(id);
    navigate('/dashboard/products');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-400">ΚΑΤΑΣΤΗΜΑ</label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white hover:text-green-400 font-bold"
          >
            +
          </button>
        </div>
        <select
          value={restaurantId || ''}
          onChange={handleSelect}
          className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700"
        >
          <option value="">-- Επιλέξτε --</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {qrCodeUrl && (
        <div className="mb-6 bg-white p-3 rounded-xl flex flex-col items-center">
          <img src={qrCodeUrl} alt="QR Code καταστήματος" className="w-32 h-32" />
          <span className="text-slate-600 text-xs mt-2 font-medium">QR Menu</span>
        </div>
      )}

      <CreateStore
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStoreCreated={fetchStores}
      />
    </div>
  );
}