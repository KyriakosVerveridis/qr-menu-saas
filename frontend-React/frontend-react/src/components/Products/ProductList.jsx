import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import ProductForm from './ProductForm';
import CategoryList from '../Category/CategoryList';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const { restaurantId } = useRestaurant();
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
    fetchProducts();
  }, [restaurantId]);

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
    <>
      <div className="md:col-span-1 md:pr-6">
        <CategoryList restaurantId={restaurantId} />
      </div>

      <div className="md:col-span-2 md:pl-6">
        <h3 className="font-bold mb-4">Προϊόντα</h3>

        <button
          onClick={handleAdd}
          className="w-full bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 px-4 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"
        >
          + Προϊόν
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900">
                  {editingProduct ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
                </h4>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
              </div>

              <ProductForm
                key={editingProduct?.id || 'new'}
                restaurantId={restaurantId}
                initialData={editingProduct}
                onSave={() => { setShowForm(false); fetchProducts(); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
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
      </div>
    </>
  );
}