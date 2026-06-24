import { useState } from 'react';
import axios from 'axios';

export default function CreateStore({ isOpen, onClose, onStoreCreated }) {
  const [formData, setFormData] = useState({ name: '', address: '', phone_number: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/restaurants/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onStoreCreated(); // Καλεί τη συνάρτηση ανανέωσης της λίστας στο Sidebar
      onClose();        // Κλείνει το Modal
      setFormData({ name: '', address: '', phone_number: '', email: '' });
    } catch (err) {
      alert("Αποτυχία δημιουργίας καταστήματος");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-sm text-black shadow-xl">
        <h3 className="font-bold mb-4 text-lg">Νέο Κατάστημα</h3>
        
        <input 
          placeholder="Όνομα Καταστήματος" required
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          placeholder="Διεύθυνση"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        <input 
          placeholder="Τηλέφωνο"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
        />
        <input 
          placeholder="Email" type="email"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold">Αποθήκευση</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded">Άκυρο</button>
        </div>
      </form>
    </div>
  );
}