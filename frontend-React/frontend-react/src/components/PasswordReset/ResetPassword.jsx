import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/accounts/password-reset-confirm/${uidb64}/${token}/`, {
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Νέος Κωδικός</h2>

        {success ? (
          <p style={{ textAlign: 'center', color: '#16a34a' }}>
            Ο κωδικός άλλαξε επιτυχώς! Μεταφορά στη σύνδεση...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Νέος Κωδικός:</label>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px', paddingRight: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            <label>Επιβεβαίωση Κωδικού:</label>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px', paddingRight: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Αποθήκευση...' : 'Αλλαγή Κωδικού'}
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