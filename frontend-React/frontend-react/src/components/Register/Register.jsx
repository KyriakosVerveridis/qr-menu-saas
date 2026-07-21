import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/accounts/register/`, {
        username,
        email,
        password
      });
      alert("Εγγραφή επιτυχής! Παρακαλώ συνδεθείτε.");
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
      } else {
        alert("Αποτυχία εγγραφής. Δοκιμάστε ξανά.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleRegister} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Account</h2>

        <label>Username:</label>
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required style={{ width:'100%', padding:'10px', marginBottom:'5px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />
        {errors.username && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{errors.username[0]}</p>}

        <label>Email:</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required style={{ width:'100%', padding:'10px', marginBottom:'5px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />
        {errors.email && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{errors.email[0]}</p>}

        <label>Password:</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required style={{ width:'100%', padding:'10px', marginBottom:'5px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />
        {errors.password && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{errors.password[0]}</p>}

        <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', marginTop: '10px', background:'#059669', color:'white', border:'none', borderRadius:'6px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Εγγραφή...' : 'Register'}
        </button>
      </form>
    </div>
  );
}