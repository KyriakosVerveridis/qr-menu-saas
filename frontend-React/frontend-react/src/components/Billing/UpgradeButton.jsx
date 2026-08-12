import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function UpgradeButton({ restaurantId }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const res = await axios.post(
        `${API_URL}/api/billing/create-checkout-session/`,
        { restaurant_id: restaurantId, plan_type: planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.checkout_url;
    } catch (err) {
      alert('Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={() => handleUpgrade('yearly')}
        disabled={loading}
        style={{ padding: '10px 16px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        Ετήσιο - 30€
      </button>
      <button
        onClick={() => handleUpgrade('monthly')}
        disabled={loading}
        style={{ padding: '10px 16px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        Μηνιαίο - 2.99€
      </button>
    </div>
  );
}