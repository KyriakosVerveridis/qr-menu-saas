import { useRestaurant } from '../../context/RestaurantContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function CategoryList() {
  const { restaurantId } = useRestaurant();
  const [categories, setCategories] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategory, setSelectedMasterCategory] = useState('');

  const fetchCategories = () => {
    if (!restaurantId) return;
    axios.get(`${API_URL}/api/categories/my-categories/?restaurant=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setCategories(res.data))
    .catch(err => console.error("Error:", err));
  };

  const fetchMasterCategories = () => {
    if (!restaurantId) return;

    axios.get(`${API_URL}/api/restaurants/${restaurantId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => {
      const businessTypeId = res.data.business_type;
      if (businessTypeId) {
        return axios.get(`${API_URL}/api/business-types/${businessTypeId}/categories/`);
      }
      return axios.get(`${API_URL}/api/categories/master-list/`);
    })
    .then(res => {
      const list = res.data.map(item =>
        item.master_category ? item.master_category : item
      );
      setMasterCategories(list);
    })
    .catch(err => console.error("Error fetching master categories:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, [restaurantId]);

  useEffect(() => {
    fetchMasterCategories();
  }, [restaurantId]);

  const handleAddCategory = () => {
    if (!selectedMasterCategory) return;
    axios.post(`${API_URL}/api/categories/my-categories/`,
      { master_category: selectedMasterCategory, restaurant: restaurantId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
    )
    .then(() => {
      setSelectedMasterCategory('');
      fetchCategories();
    })
    .catch(err => {
      const message = err.response?.data?.error || "Αποτυχία προσθήκης κατηγορίας.";
      alert(message);
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (!window.confirm("Θέλεις σίγουρα να αφαιρέσεις αυτή την κατηγορία από το κατάστημα;")) return;
    axios.delete(`${API_URL}/api/categories/my-categories/${categoryId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(() => fetchCategories())
    .catch(err => {
      console.error("Error deleting category:", err);
      alert("Αποτυχία διαγραφής κατηγορίας.");
    });
  };

  const getMasterCategoryLabel = (mc) => {
    const elTranslation = mc.translations.find(t => t.language_code === 'el');
    return elTranslation ? elTranslation.name : `#${mc.id}`;
  };

  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">Κατηγορίες Μενού</h3>
      <div className="grid gap-3 mb-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
            <span className="font-medium text-slate-800">{cat.master_category_name}</span>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Αφαίρεση
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={selectedMasterCategory}
          onChange={(e) => setSelectedMasterCategory(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="">-- Επιλέξτε Κατηγορία --</option>
          {masterCategories.map(mc => (
            <option key={mc.id} value={mc.id}>
              {getMasterCategoryLabel(mc)}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          + Προσθήκη
        </button>
      </div>
    </div>
  );
}