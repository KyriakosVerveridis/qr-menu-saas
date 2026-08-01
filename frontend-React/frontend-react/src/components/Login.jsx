import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/accounts/auth/login/`, {
        username,
        password
      });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      const storesRes = await axios.get(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Bearer ${res.data.access}` }
      });

      if (storesRes.data.length === 0) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert("Λάθος στοιχεία εισόδου!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Merchant Login</h2>

        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width:'100%', padding:'10px', marginBottom:'15px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />

        <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', background:'#0284c7', color:'white', border:'none', borderRadius:'6px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Σύνδεση...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/forgot-password" style={{ color: '#0284c7', fontSize: '14px' }}>
            Ξεχάσατε τον κωδικό;
          </Link>
        </p>
      </form>
    </div>
  );
}