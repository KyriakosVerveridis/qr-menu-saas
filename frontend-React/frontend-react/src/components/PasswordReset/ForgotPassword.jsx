import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/accounts/password-reset/`, { email });
      setSubmitted(true);
    } catch (err) {
      // Ίδιο μήνυμα ό,τι κι αν συμβεί (ασφάλεια, backend το κάνει ήδη)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Ξεχάσατε τον κωδικό;</h2>

        {submitted ? (
          <p style={{ textAlign: 'center', color: '#475569' }}>
            Αν το email υπάρχει στο σύστημά μας, θα λάβετε σύνδεσμο επαναφοράς σε λίγα λεπτά.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Αποστολή...' : 'Αποστολή Συνδέσμου'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#0284c7', fontSize: '14px' }}>← Πίσω στη σύνδεση</Link>
        </p>
      </div>
    </div>
  );
}