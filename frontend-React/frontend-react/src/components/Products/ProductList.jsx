import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import ProductForm from './ProductForm';
import CategoryList from '../Category/CategoryList';

export default function ProductList() {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    if (!restaurantId) return;
    axios.get(`http://127.0.0.1:8000/api/menu/items/?restaurant=${restaurantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
    .then(res => setProducts(res.data))
    .catch(err => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [restaurantId, activeTab]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Είστε σίγουροι για τη διαγραφή του προϊόντος;")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/menu/items/${productId}/?restaurant=${restaurantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        });
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Αποτυχία διαγραφής.");
      }
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('products')} 
          className={`pb-2 ${activeTab === 'products' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
        >
          Προϊόντα
        </button>
        <button 
          onClick={() => setActiveTab('categories')} 
          className={`pb-2 ${activeTab === 'categories' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
        >
          Κατηγορίες
        </button>
      </div>

      {activeTab === 'categories' ? (
        <CategoryList restaurantId={restaurantId} />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Προϊόντα Καταστήματος</h2>
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
              + Προσθήκη Προϊόντος
            </button>
          </div>

          {showForm && (
            <ProductForm 
              restaurantId={restaurantId} 
              initialData={editingProduct} 
              onSave={() => { setShowForm(false); fetchProducts(); }} 
            />
          )}

          <div className="grid gap-4 mt-4">
            {products.map(p => (
              <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p>{p.price}€</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(p)} className="text-blue-500">Επεξεργασία</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 font-bold">Διαγραφή</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}