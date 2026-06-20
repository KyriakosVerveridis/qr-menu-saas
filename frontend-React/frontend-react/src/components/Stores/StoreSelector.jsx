import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Πρόσθεσε αυτό
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';

export default function StoreSelector() {
  const [stores, setStores] = useState([]);
  const { updateRestaurant } = useRestaurant();
  const navigate = useNavigate(); // 2. Όρισε το navigate

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/restaurants/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setStores(res.data))
    .catch(err => console.error("Error fetching stores:", err));
  }, []);

  const handleSelect = (e) => {
    const id = e.target.value;
    if (!id) return;
    
    updateRestaurant(id); // Ενημέρωση Context
    navigate('/dashboard/products'); // 3. Μετάβαση στα προϊόντα
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6">
      <label className="block text-sm font-semibold mb-2">Επιλέξτε Κατάστημα:</label>
      <select 
        onChange={handleSelect} // 4. Χρήση της νέας συνάρτησης
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="">-- Επιλέξτε --</option>
        {stores.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}