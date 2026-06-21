import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MenuList from './MenuList';
// import ProductList from '../Menu/ProductList';

export default function MenuPage() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/menu/public/${slug}/`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Σφάλμα:", err));
  }, [slug]);

  return (
    <div>
      <h1>Μενού: {slug}</h1>
      <MenuList items={items} />
    </div>
  );
}