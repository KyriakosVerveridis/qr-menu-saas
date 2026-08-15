import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ManageSubscriptionButton({ restaurantId }) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const res = await axios.post(
        `${API_URL}/api/billing/create-billing-portal-session/`,
        { restaurant_id: restaurantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.portal_url;
    } catch (err) {
      alert('Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageSubscription}
      disabled={loading}
      style={{ padding: '10px 16px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? 'Φόρτωση...' : 'Διαχείριση Συνδρομής'}
    </button>
  );
}