import { useRestaurant } from '../../context/RestaurantContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryList() {
  const { restaurantId } = useRestaurant();
  const [categories, setCategories] = useState([]);

  const fetchCategories = () => {
    if (!restaurantId) return;
    axios.get(`http://127.0.0.1:8000/api/categories/my-categories/?restaurant=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setCategories(res.data))
    .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, [restaurantId]);

  const handleAddCategory = () => {
    const name = prompt("Όνομα νέας κατηγορίας:");
    if (name) {
      axios.post(`http://127.0.0.1:8000/api/categories/my-categories/`, 
        { name, restaurant: restaurantId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
      ).then(() => fetchCategories());
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">Κατηγορίες Μενού</h3>
      <div className="grid gap-2 mb-4">
        {categories.map(cat => (
          <div key={cat.id} className="p-2 border rounded flex justify-between">
            {cat.name}
          </div>
        ))}
      </div>
      <button 
        onClick={handleAddCategory}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Προσθήκη Κατηγορίας
      </button>
    </div>
  );
}