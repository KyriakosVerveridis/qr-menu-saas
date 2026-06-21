import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductForm({ restaurantId, onSave, initialData = null }) {
  const [categories, setCategories] = useState([]);
  // Αν επεξεργαζόμαστε υπάρχον προϊόν, παίρνουμε το ID της κατηγορίας του
  const [formData, setFormData] = useState(
    initialData ? { ...initialData, category: initialData.category?.id || initialData.category } 
                : { name: '', price: '', category: '', description: '' }
  );

  useEffect(() => {
    // Φόρτωση των δικών σου κατηγοριών (όχι της master list)
    axios.get(`http://127.0.0.1:8000/api/categories/master-list/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => {
    setCategories(res.data);
  })
    .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } };
    
    const payload = { 
      ...formData, 
      restaurant: restaurantId,
      category: parseInt(formData.category) // Το στέλνουμε ως ID
    };

    try {
      if (initialData) {
        await axios.put(`http://127.0.0.1:8000/api/menu/items/${initialData.id}/?restaurant=${restaurantId}`, payload, config);
      } else {
        await axios.post(`http://127.0.0.1:8000/api/menu/items/?restaurant=${restaurantId}`, payload, config);
      }
      onSave(); 
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
      alert("Αποτυχία αποθήκευσης. Ελέγξτε την κονσόλα.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-lg shadow-sm space-y-4">
      <input 
        className="w-full p-2 border rounded"
        placeholder="Όνομα Προϊόντος"
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
        required
      />
      <input 
        className="w-full p-2 border rounded"
        type="number"
        placeholder="Τιμή"
        value={formData.price}
        onChange={e => setFormData({...formData, price: e.target.value})}
        required
      />
      <select 
        className="w-full p-2 border rounded"
        value={formData.category}
        onChange={e => setFormData({...formData, category: e.target.value})}
        required
      >
        <option value="">-- Επιλέξτε Κατηγορία --</option>
        {categories && categories.length > 0 ? (
          categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.master_category_name || c.name}
            </option>
          ))
        ) : (
          <option disabled>Φόρτωση κατηγοριών...</option>
        )}
      </select>
      
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Αποθήκευση
      </button>
    </form>
  );
}