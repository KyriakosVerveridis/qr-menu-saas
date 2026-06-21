import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Πρόσθεσε αυτό

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate(); // 2. Ορισμός του navigate

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/restaurants/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setStores(res.data))
    .catch(err => console.error("Σφάλμα:", err));
  }, []);

  return (
    <div>
      <h2>Τα καταστήματά μου</h2>
      {stores.map(store => (
        <div key={store.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <h3>{store.name}</h3>
          
          {/* 3. Το κουμπί εδώ */}
          <button onClick={() => navigate(`/dashboard/menu/${store.slug}`)}>
            Επεξεργασία Μενού
          </button>
          
        </div>
      ))}
    </div>
  );
}