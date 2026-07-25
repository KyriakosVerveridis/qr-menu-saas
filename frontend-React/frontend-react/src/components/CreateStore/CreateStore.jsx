import { useState, useEffect } from 'react';
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
      const payload = {
        ...formData,
        business_type: formData.business_type || null,
      };
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-sm text-black shadow-xl">
        <h3 className="font-bold mb-4 text-lg">Νέο Κατάστημα</h3>

        <input
          placeholder="Όνομα Καταστήματος" required
          value={formData.name}
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />

        <select
          value={formData.business_type}
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, business_type: e.target.value})}
        >
          <option value="">-- Τύπος καταστήματος (προαιρετικό) --</option>
          {businessTypes.map(bt => (
            <option key={bt.id} value={bt.id}>{bt.name}</option>
          ))}
        </select>

        <input
          placeholder="Διεύθυνση"
          value={formData.address}
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        <input
          placeholder="Τηλέφωνο"
          value={formData.phone_number}
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
        />
        <input
          placeholder="Email" type="email"
          value={formData.email}
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded">Άκυρο</button>
        </div>
      </form>
    </div>
  );
}