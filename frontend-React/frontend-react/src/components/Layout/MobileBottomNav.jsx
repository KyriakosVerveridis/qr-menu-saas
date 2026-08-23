import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import CreateStore from '../CreateStore/CreateStore';
import StoreSelectorModal from '../Stores/StoreSelectorModal';
import QrCodeModal from '../QrCode/QrCodeModal';
import UpgradeModal from '../Billing/UpgradeModal';
import { Store, Plus, UtensilsCrossed, QrCode, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function MobileBottomNav() {
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const { restaurantId, updateRestaurant } = useRestaurant();
  const navigate = useNavigate();

  const fetchStores = () => {
    axios.get(`${API_URL}/api/restaurants/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setStores(res.data))
    .catch(err => console.error("Error fetching stores:", err));
  };

  useEffect(() => {
    fetchStores();
  }, []);

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
    .catch(() => setQrCodeUrl(null));

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [restaurantId]);

  const navItemClass = "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-emerald-600 active:bg-emerald-50 transition-colors";

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-40">
        <button onClick={() => setIsStoreModalOpen(true)} className={navItemClass}>
            <Store size={26} />
            <span className="text-[10px] font-medium">Καταστήματα</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className={navItemClass}>
            <Plus size={26} />
            <span className="text-[10px] font-medium">Δημιουργία</span>
        </button>
        <button onClick={() => navigate('/dashboard/products')} className={navItemClass}>
            <UtensilsCrossed size={26} />
            <span className="text-[10px] font-medium">Μενού</span>
        </button>
        <button onClick={() => setIsQrModalOpen(true)} className={navItemClass}>
            <QrCode size={26} />
            <span className="text-[10px] font-medium">QR Κωδικός</span>
        </button>
        <button onClick={() => setIsUpgradeModalOpen(true)} className={navItemClass}>
            <Star size={26} />
            <span className="text-[10px] font-medium">Αναβάθμιση</span>
        </button>
        </div>

      <CreateStore isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStoreCreated={fetchStores} />

      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        stores={stores}
        selectedId={restaurantId}
        onSelect={(id) => {
          updateRestaurant(id);
          navigate('/dashboard/products');
          setIsStoreModalOpen(false);
        }}
      />

      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} qrCodeUrl={qrCodeUrl} />

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} restaurantId={restaurantId} />
    </>
  );
}