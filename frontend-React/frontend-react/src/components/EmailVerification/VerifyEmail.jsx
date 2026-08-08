import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);

  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSubmitted, setResendSubmitted] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    axios.get(`${API_URL}/api/accounts/verify-email/${uidb64}/${token}/`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Κάτι πήγε στραβά.');
      });
  }, [uidb64, token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/api/accounts/resend-verification/`, { email: resendEmail });
      setResendSubmitted(true);
    } catch (err) {
      setResendSubmitted(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {status === 'loading' && (
          <p style={{ color: '#475569' }}>Επιβεβαίωση email...</p>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ marginBottom: '15px', color: '#16a34a' }}>Επιτυχία! ✅</h2>
            <p style={{ color: '#475569', marginBottom: '20px' }}>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ marginBottom: '15px', color: '#dc2626' }}>Ουπς!</h2>
            <p style={{ color: '#475569', marginBottom: '20px' }}>{message}</p>

            {resendSubmitted ? (
              <p style={{ color: '#475569', fontSize: '14px' }}>
                Αν το email υπάρχει και δεν έχει επιβεβαιωθεί, θα λάβετε νέο σύνδεσμο.
              </p>
            ) : (
              <form onSubmit={handleResend} style={{ textAlign: 'left', marginTop: '20px' }}>
                <label style={{ fontSize: '14px' }}>Στείλε ξανά τον σύνδεσμο:</label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  placeholder="το email σου"
                  style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  style={{ width: '100%', padding: '10px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: resendLoading ? 'not-allowed' : 'pointer', opacity: resendLoading ? 0.7 : 1 }}
                >
                  {resendLoading ? 'Αποστολή...' : 'Αποστολή νέου συνδέσμου'}
                </button>
              </form>
            )}
          </>
        )}

        <p style={{ marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#0284c7', fontSize: '14px' }}>
            → Μετάβαση στη σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}