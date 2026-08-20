import { useRestaurant } from '../../context/RestaurantContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function CategoryList() {
  const { restaurantId } = useRestaurant();
  const [categories, setCategories] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleAddCategory = (masterCategoryId) => {
    axios.post(`${API_URL}/api/categories/my-categories/`,
      { master_category: masterCategoryId, restaurant: restaurantId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
    )
    .then(() => {
      setShowModal(false);
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

  const usedMasterCategoryIds = categories.map(c => c.master_category);
  const availableMasterCategories = masterCategories.filter(mc => !usedMasterCategoryIds.includes(mc.id));
  
  const toggleSelection = (masterCategoryId) => {
    setSelectedIds(prev =>
      prev.includes(masterCategoryId)
        ? prev.filter(id => id !== masterCategoryId)
        : [...prev, masterCategoryId]
    );
  };

  const handleSaveCategories = async () => {
    for (const id of selectedIds) {
      await axios.post(`${API_URL}/api/categories/my-categories/`,
        { master_category: id, restaurant: restaurantId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
      ).catch(err => console.error("Error adding category:", err));
    }
    setSelectedIds([]);
    setShowModal(false);
    fetchCategories();
  };
  return (
    <div>
      <h3 className="font-bold mb-4">Κατηγορίες Μενού</h3>

      <div className="grid gap-3 mb-4">
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 px-4 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"
      >
        + Κατηγορία
      </button>
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
            <span className="font-medium text-slate-800">{cat.master_category_name}</span>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Διαγραφή
            </button>
          </div>
        ))}
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-900">Επιλέξτε Κατηγορίες</h4>
              <button onClick={() => { setShowModal(false); setSelectedIds([]); }} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>

            <div className="overflow-y-auto space-y-2 mb-4">
              {availableMasterCategories.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Όλες οι διαθέσιμες κατηγορίες έχουν ήδη προστεθεί.</p>
              ) : (
                availableMasterCategories.map(mc => {
                  const isSelected = selectedIds.includes(mc.id);
                  return (
                    <button
                      key={mc.id}
                      onClick={() => toggleSelection(mc.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors font-medium ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {getMasterCategoryLabel(mc)}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveCategories}
                disabled={selectedIds.length === 0}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Αποθήκευση
              </button>
              <button
                onClick={() => { setShowModal(false); setSelectedIds([]); }}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Άκυρο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}