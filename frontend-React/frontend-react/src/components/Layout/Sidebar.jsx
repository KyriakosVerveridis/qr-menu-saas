import { useState, useEffect, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import CreateStore from '../CreateStore/CreateStore';
import StoreSelectorModal from '../Stores/StoreSelectorModal';
import QrCodeModal from '../QrCode/QrCodeModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function Sidebar({ isOpen, onClose }) {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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

  const selectedStoreName = stores.find(s => String(s.id) === String(restaurantId))?.name;

  const navBtnClass = "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-4 flex flex-col z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">M</span>
            MenuApp
          </h2>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-700 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="mb-2">
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className={`${navBtnClass} text-left`}
          >
            <span>🏪</span>
            <span>{selectedStoreName || 'Επιλέξτε κατάστημα'}</span>
          </button>
          {error && <p className="text-red-500 text-xs mt-2 px-3">{error}</p>}
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setIsModalOpen(true)} className={navBtnClass}>
            <span>➕</span>
            <span>Νέο κατάστημα</span>
          </button>
          <NavLink to="/dashboard/products" className={navBtnClass} onClick={onClose}>
            <span>🍽️</span>
            <span>Διαχείριση Μενού</span>
          </NavLink>
          <button onClick={() => setIsQrModalOpen(true)} className={navBtnClass}>
            <span>📱</span>
            <span>QR Κωδικοί</span>
          </button>
        </nav>

        <CreateStore
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStoreCreated={fetchStores}
        />

        <StoreSelectorModal
          isOpen={isStoreModalOpen}
          onClose={() => setIsStoreModalOpen(false)}
          stores={stores}
          selectedId={restaurantId}
          onSelect={(id) => {
            updateRestaurant(id);
            navigate('/dashboard/products');
            onClose?.();
          }}
        />

        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          qrCodeUrl={qrCodeUrl}
        />
      </div>
    </>
  );
}