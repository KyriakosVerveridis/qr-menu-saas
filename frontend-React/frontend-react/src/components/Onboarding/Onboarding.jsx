import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Onboarding() {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', business_type: '' });
  const [submitting, setSubmitting] = useState(false);
  const { updateRestaurant } = useRestaurant();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/business-types/list/`)
      .then(res => setBusinessTypes(res.data))
      .catch(err => console.error("Error fetching business types:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, business_type: formData.business_type || null };
      const res = await axios.post(`${API_URL}/api/restaurants/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      updateRestaurant(res.data.id);
      navigate('/dashboard/products');
    } catch (err) {
      const message = err.response?.data?.name?.[0] || "Αποτυχία δημιουργίας καταστήματος";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Καλώς ήρθες!</h1>
          <p className="text-slate-500 text-sm">Ας δημιουργήσουμε το πρώτο σου κατάστημα.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Όνομα Καταστήματος</label>
            <input
              className="w-full p-2 border border-slate-200 rounded-xl"
              placeholder="π.χ., Η Πράσινη Κουζίνα"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Τύπος Καταστήματος</label>
            <select
              className="w-full p-2 border border-slate-200 rounded-xl"
              value={formData.business_type}
              onChange={e => setFormData({ ...formData, business_type: e.target.value })}
            >
              <option value="">-- Επιλέξτε (προαιρετικό) --</option>
              {businessTypes.map(bt => (
                <option key={bt.id} value={bt.id}>{bt.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Δημιουργία...' : 'Δημιουργία Καταστήματος'}
          </button>
        </form>
      </div>
    </div>
  );
}