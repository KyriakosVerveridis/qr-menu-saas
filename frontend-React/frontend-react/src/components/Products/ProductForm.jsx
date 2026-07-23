import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductForm({ restaurantId, onSave, onCancel, initialData = null }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  const getTranslation = (lang) => {
    if (!initialData?.translations) return { name: '', description: '' };
    const t = initialData.translations.find(tr => tr.language_code === lang);
    return { name: t?.name || '', description: t?.description || '' };
  };

  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    price: initialData?.price || '',
    name_el: getTranslation('el').name,
    description_el: getTranslation('el').description,
    name_en: getTranslation('en').name,
    description_en: getTranslation('en').description,
  });

  useEffect(() => {
    if (!restaurantId) return;
    axios.get(`${API_URL}/api/categories/my-categories/?restaurant=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setCategories(res.data))
    .catch(err => console.error("Error fetching categories:", err));
  }, [restaurantId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const translations = [
      { language_code: 'el', name: formData.name_el, description: formData.description_el },
    ];
    if (formData.name_en) {
      translations.push({ language_code: 'en', name: formData.name_en, description: formData.description_en });
    }

    const form = new FormData();
    form.append('category', parseInt(formData.category));
    form.append('price', formData.price);
    form.append('restaurant', restaurantId);
    form.append('translations', JSON.stringify(translations));
    if (imageFile) {
      form.append('image_file', imageFile);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    };

    try {
      if (initialData) {
        await axios.put(`${API_URL}/api/menu/items/${initialData.id}/?restaurant=${restaurantId}`, form, config);
      } else {
        await axios.post(`${API_URL}/api/menu/items/?restaurant=${restaurantId}`, form, config);
      }
      onSave();
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
      alert("Αποτυχία αποθήκευσης. Ελέγξτε την κονσόλα.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-slate-200 rounded-2xl space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600 mb-2 block">Φωτογραφία</label>
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl mb-2 border border-slate-200" />
        )}
        <label className="inline-block bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm cursor-pointer hover:bg-slate-200 transition-colors">
          {imagePreview ? '📷 Αλλαγή φωτογραφίας' : '📷 Προσθήκη φωτογραφίας'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Όνομα (Ελληνικά)</label>
        <input
          className="w-full p-2 border border-slate-200 rounded-xl"
          value={formData.name_el}
          onChange={e => setFormData({...formData, name_el: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Περιγραφή (Ελληνικά)</label>
        <textarea
          className="w-full p-2 border border-slate-200 rounded-xl"
          value={formData.description_el}
          onChange={e => setFormData({...formData, description_el: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Name (English) — προαιρετικό</label>
        <input
          className="w-full p-2 border border-slate-200 rounded-xl"
          value={formData.name_en}
          onChange={e => setFormData({...formData, name_en: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">Description (English)</label>
        <textarea
          className="w-full p-2 border border-slate-200 rounded-xl"
          value={formData.description_en}
          onChange={e => setFormData({...formData, description_en: e.target.value})}
        />
      </div>

      <input
        className="w-full p-2 border border-slate-200 rounded-xl"
        type="number"
        step="0.01"
        placeholder="Τιμή"
        value={formData.price}
        onChange={e => setFormData({...formData, price: e.target.value})}
        required
      />

      <select
        className="w-full p-2 border border-slate-200 rounded-xl"
        value={formData.category}
        onChange={e => setFormData({...formData, category: e.target.value})}
        required
      >
        <option value="">-- Επιλέξτε Κατηγορία --</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>
            {c.master_category_name}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
          Άκυρο
        </button>
      </div>
    </form>
  );
}