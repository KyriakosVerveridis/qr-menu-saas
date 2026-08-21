import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';

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

export default function PublishModal({ isOpen, onClose }) {
  const { restaurantId } = useRestaurant();
  const [hasSubscription, setHasSubscription] = useState(null);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !restaurantId) return;
    setMessage('');
    axios.get(`${API_URL}/api/billing/subscription-status/?restaurant_id=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
    })
      .then(res => setHasSubscription(res.data.has_subscription))
      .catch(() => setHasSubscription(false));
  }, [isOpen, restaurantId]);

  const toggleLang = (code) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleTranslate = async () => {
    setTranslating(true);
    setMessage('');
    try {
      for (const code of selectedLangs) {
        await axios.post(`${API_URL}/api/menu/translate/`,
          { restaurant_id: restaurantId, target_language: code },
          { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
        );
      }
      setMessage('Η μετάφραση ολοκληρώθηκε επιτυχώς!');
      setSelectedLangs([]);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Κάτι πήγε στραβά.');
    } finally {
      setTranslating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[70vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-900">Δημοσίευση Μενού</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        {hasSubscription === null ? (
          <p className="text-sm text-slate-500">Φόρτωση...</p>
        ) : !hasSubscription ? (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Το κατάστημά σου χρειάζεται ενεργή συνδρομή Premium για να ενεργοποιηθεί το δημόσιο μενού.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">Επίλεξε γλώσσες για αυτόματη μετάφραση:</p>
            <div className="overflow-y-auto space-y-2 mb-4">
              {languages.map(lang => {
                const isSelected = selectedLangs.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors font-medium ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lang.name}
                  </button>
                );
              })}
            </div>

            {message && <p className="text-sm text-emerald-600 mb-3">{message}</p>}

            <button
              onClick={handleTranslate}
              disabled={selectedLangs.length === 0 || translating}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {translating ? 'Μετάφραση...' : 'Μετάφρασε'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}