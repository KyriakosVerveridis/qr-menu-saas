import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateStore({ isOpen, onClose, onStoreCreated }) {
  const [formData, setFormData] = useState({ name: '', address: '', phone_number: '', email: '', business_type: '' });
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/business-types/list/`)
      .then(res => setBusinessTypes(res.data))
      .catch(err => console.error("Error fetching business types:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const payload = { ...formData, business_type: formData.business_type || null };
      await axios.post(`${API_URL}/api/restaurants/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onStoreCreated();
      onClose();
      setFormData({ name: '', address: '', phone_number: '', email: '', business_type: '' });
    } catch (err) {
      const message = err.response?.data?.name?.[0] || "Αποτυχία δημιουργίας καταστήματος";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-xl">
              🏪
            </div>
            <h2 className="text-xl font-bold text-slate-900">Νέο Κατάστημα</h2>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Όνομα Καταστήματος</label>
            <input
              placeholder="π.χ., Η Πράσινη Κουζίνα"
              required
              value={formData.name}
              className="w-full p-2 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Τύπος Καταστήματος</label>
            <select
              value={formData.business_type}
              className="w-full p-2 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, business_type: e.target.value})}
            >
              <option value="">-- Επιλέξτε (προαιρετικό) --</option>
              {businessTypes.map(bt => (
                <option key={bt.id} value={bt.id}>{bt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Διεύθυνση</label>
            <input
              placeholder="Διεύθυνση"
              value={formData.address}
              className="w-full p-2 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Τηλέφωνο</label>
            <input
              placeholder="Τηλέφωνο"
              value={formData.phone_number}
              className="w-full p-2 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
            <input
              placeholder="Email" type="email"
              value={formData.email}
              className="w-full p-2 border border-slate-200 rounded-xl"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {loading ? 'Αποθήκευση...' : 'Δημιουργία'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Άκυρο
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}