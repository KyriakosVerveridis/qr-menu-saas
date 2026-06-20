import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('access', res.data.access);
      navigate('/dashboard');
    } catch (err) {
      alert("Λάθος στοιχεία εισόδου!");
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

        <button type="submit" style={{ width:'100%', padding:'12px', background:'#0284c7', color:'white', border:'none', borderRadius:'6px', fontWeight:'600', cursor:'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}