import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';

export default function Sidebar() {
  const [stores, setStores] = useState([]);
  const { updateRestaurant } = useRestaurant();
  const navigate = useNavigate();

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
    updateRestaurant(id);
    navigate('/dashboard/products');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      
      {/* Select Box στο Sidebar */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 mb-2">ΚΑΤΑΣΤΗΜΑ</label>
        <select 
          onChange={handleSelect}
          className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700"
        >
          <option value="">-- Επιλέξτε --</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <nav className="flex-1 space-y-2">
        <Link to="/dashboard/products" className="block p-2 hover:bg-slate-800 rounded-lg">Προϊόντα</Link>
      </nav>
    </div>
  );
}