import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import axios from 'axios';
import CreateStore from '../CreateStore/CreateStore';
import StoreSelectorModal from './StoreSelectorModal';
import { Store, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function StoreSelector() {
  const [stores, setStores] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const { updateRestaurant } = useRestaurant();
  const navigate = useNavigate();

  const fetchStores = () => {
    axios.get(`${API_URL}/api/restaurants/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setStores(res.data))
    .catch(err => console.error("Error fetching stores:", err));
  };

  const handleSelectClick = () => {
    fetchStores();
    setIsSelectModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        Καλωσήρθες!
      </h2>
      <p className="text-slate-500 max-w-md mb-6">
        Ξεκίνα δημιουργώντας ένα νέο κατάστημα, ή επίλεξε ένα ήδη υπάρχον.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-4 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Plus size={20} />
          Δημιουργία Καταστήματος
        </button>
        <button
          onClick={handleSelectClick}
          className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-4 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Store size={20} />
          Επιλογή Καταστήματος
        </button>
      </div>

      <CreateStore
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStoreCreated={fetchStores}
      />

      <StoreSelectorModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        stores={stores}
        onSelect={(id) => {
          updateRestaurant(id);
          navigate('/dashboard/products');
          setIsSelectModalOpen(false);
        }}
      />
    </div>
  );
}