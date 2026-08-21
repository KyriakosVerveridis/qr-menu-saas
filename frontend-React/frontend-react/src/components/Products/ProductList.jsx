import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRestaurant } from '../../context/RestaurantContext';
import ProductForm from './ProductForm';
import CategoryList from '../Category/CategoryList';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API_URL = import.meta.env.VITE_API_URL;

function SortableProduct({ product, getProductName, handleEdit, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
        isDragging ? 'bg-emerald-100 border-emerald-400' : 'bg-white border-slate-200'
      }`}
    >
      <span
        {...listeners}
        style={{ touchAction: 'none' }}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 text-xl px-1 select-none"
      >
        ⋮⋮
      </span>

      <div className="flex-1">
        <h3 className="font-medium text-slate-800">{getProductName(product)}</h3>
        <p className="text-sm text-slate-500">{product.price}€</p>
      </div>

      <div className="flex gap-4 text-sm font-medium">
        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-700 transition-colors">Επεξεργασία</button>
        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 transition-colors">Διαγραφή</button>
      </div>
    </div>
  );
}

export default function ProductList() {
  const { restaurantId } = useRestaurant();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryScrollRef = useRef(null);
  const savedScrollPosition = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

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
    setSelectedCategory(null);
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

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory.id)
    : products;

  const handleSelectCategory = (cat) => {
    if (categoryScrollRef.current) {
      savedScrollPosition.current = categoryScrollRef.current.scrollTop;
    }
    setSelectedCategory(cat);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setTimeout(() => {
      if (categoryScrollRef.current) {
        categoryScrollRef.current.scrollTop = savedScrollPosition.current;
      }
    }, 0);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredProducts.findIndex(p => p.id === active.id);
    const newIndex = filteredProducts.findIndex(p => p.id === over.id);
    const reordered = arrayMove(filteredProducts, oldIndex, newIndex);

    const otherProducts = products.filter(p => p.category !== selectedCategory.id);
    setProducts([...otherProducts, ...reordered]);

    const itemIds = reordered.map(p => p.id);
    await axios.post(`${API_URL}/api/menu/reorder/`,
      { item_ids: itemIds },
      { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
    ).catch(err => console.error("Error reordering:", err));
  };

  return (
    <>
      <div ref={categoryScrollRef} className={`md:col-span-1 md:pr-6 overflow-y-auto ${selectedCategory ? 'hidden md:block' : ''}`}>
        <CategoryList
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={selectedCategory?.master_category}
        />
      </div>

      <div className={`md:col-span-2 md:pl-6 ${!selectedCategory ? 'hidden md:block' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          {selectedCategory && (
            <button
              onClick={handleBackToCategories}
              className="md:hidden text-slate-600 hover:text-slate-900 text-xl"
            >
              ←
            </button>
          )}
          <h3 className="font-bold">
            {selectedCategory ? selectedCategory.master_category_name : 'Επιλέξτε κατηγορία'}
          </h3>
        </div>

        {selectedCategory && (
          <>
            <button
              onClick={handleAdd}
              className="w-full bg-emerald-50 text-emerald-700 border-2 border-dashed border-emerald-200 px-4 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors mb-4"
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
                    defaultCategoryId={selectedCategory.id}
                    onSave={() => { setShowForm(false); fetchProducts(); }}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-3 mt-4">
                  {filteredProducts.map(p => (
                    <SortableProduct
                      key={p.id}
                      product={p}
                      getProductName={getProductName}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </>
  );
}