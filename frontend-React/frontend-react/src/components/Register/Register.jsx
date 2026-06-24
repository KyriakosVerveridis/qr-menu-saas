import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Κλήση του endpoint εγγραφής που φτιάξαμε στο Django
      await axios.post('http://127.0.0.1:8000/api/accounts/register/', {
        username,
        email,
        password
      });
      alert("Εγγραφή επιτυχής! Παρακαλώ συνδεθείτε.");
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data);
      alert("Αποτυχία εγγραφής. Ελέγξτε τα στοιχεία σας.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleRegister} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Account</h2>
        
        <label>Username:</label>
        <input 
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          required style={{ width:'100%', padding:'10px', marginBottom:'15px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />

        <label>Email:</label>
        <input 
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required style={{ width:'100%', padding:'10px', marginBottom:'15px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />

        <label>Password:</label>
        <input 
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required style={{ width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #cbd5e1', borderRadius:'6px', boxSizing: 'border-box' }}
        />

        <button type="submit" style={{ width:'100%', padding:'12px', background:'#059669', color:'white', border:'none', borderRadius:'6px', fontWeight:'600', cursor:'pointer' }}>
          Register
        </button>
      </form>
    </div>
  );
}