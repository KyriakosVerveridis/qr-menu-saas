import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import ProductForm from './ProductForm';
import CategoryList from '../Category/CategoryList';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState('categories');
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    if (!restaurantId) return;
    axios.get(`${API_URL}/api/menu/items/?restaurant=${restaurantId}`, {
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
        await axios.delete(`${API_URL}/api/menu/items/${productId}/?restaurant=${restaurantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        });
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Αποτυχία διαγραφής.");
      }
    }
  };

  const getProductName = (product) => {
    const elTranslation = product.translations?.find(t => t.language_code === 'el');
    return elTranslation ? elTranslation.name : `#${product.id}`;
  };

  return (
    <div className="p-4">
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'categories'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Κατηγορίες
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Προϊόντα
        </button>
      </div>
      {activeTab === 'categories' ? (
        <CategoryList restaurantId={restaurantId} />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Προϊόντα Καταστήματος</h2>
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              + Προσθήκη Προϊόντος
            </button>
          </div>
          {showForm && (
            <ProductForm
              key={editingProduct?.id || 'new'}
              restaurantId={restaurantId}
              initialData={editingProduct}
              onSave={() => { setShowForm(false); fetchProducts(); }}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div className="grid gap-3 mt-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-slate-800">{getProductName(p)}</h3>
                  <p className="text-sm text-slate-500">{p.price}€</p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-700 transition-colors">Επεξεργασία</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 transition-colors">Διαγραφή</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
