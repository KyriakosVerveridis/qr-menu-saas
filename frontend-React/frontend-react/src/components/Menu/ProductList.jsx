import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';

export default function ProductList() {
  const { restaurantId } = useRestaurant();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Αν δεν έχει επιλεγεί κατάστημα, δεν φέρνουμε τίποτα
    if (!restaurantId) return;

    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/menu/items/?restaurant=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setProducts(res.data))
    .catch(err => console.error("Error loading products:", err))
    .finally(() => setLoading(false));
  }, [restaurantId]); // <--- Εδώ είναι το "μαγικό": κάθε φορά που το restaurantId αλλάζει, αυτό τρέχει ξανά!

  if (!restaurantId) return <p className="text-slate-500">Επιλέξτε κατάστημα για να δείτε τα προϊόντα.</p>;
  if (loading) return <p>Φόρτωση...</p>;

  return (
    <div className="space-y-4">
      {products.map(product => (
        <div key={product.id} className="flex justify-between bg-white p-4 rounded-lg border">
          <div>
            <h4 className="font-bold">{product.name}</h4>
            <p className="text-sm text-slate-600">{product.description}</p>
          </div>
          <span className="font-semibold text-sky-600">{product.price}€</span>
        </div>
      ))}
    </div>
  );
}