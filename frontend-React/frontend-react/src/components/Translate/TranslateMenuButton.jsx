import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const languages = [
  { code: 'en', name: 'Αγγλικά' },  
  { code: 'de', name: 'Γερμανικά' },
  { code: 'fr', name: 'Γαλλικά' },
  { code: 'es', name: 'Ισπανικά' },
  { code: 'it', name: 'Ιταλικά' },
  { code: 'ru', name: 'Ρωσικά' },
  { code: 'bg', name: 'Βουλγαρικά' },
  { code: 'ro', name: 'Ρουμανικά' },
  { code: 'tr', name: 'Τουρκικά' },
];

export default function TranslateMenuButton({ restaurantId }) {
  const [selectedLang, setSelectedLang] = useState('de');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('access');
      const res = await axios.post(
        `${API_URL}/api/menu/translate/`,
        { restaurant_id: restaurantId, target_language: selectedLang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Κάτι πήγε στραβά.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <h3 className="font-bold text-sm text-slate-900">Αυτόματη Μετάφραση Μενού</h3>
      <p className="text-xs text-slate-500">
        Μεταφράζει αυτόματα όλα τα προϊόντα σου, από τα Ελληνικά.
      </p>

      <div className="flex gap-2">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <button
          onClick={handleTranslate}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Μετάφραση...' : 'Μετάφρασε'}
        </button>
      </div>

      {message && <p className="text-xs text-emerald-600 font-medium">{message}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}