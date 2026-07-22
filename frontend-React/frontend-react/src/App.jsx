import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Layout/Dashboard';
import Login from './components/Login';
import StoreSelector from './components/Stores/StoreSelector';
import MenuPage from './components/MenuPage';
import ProductList from './components/Products/ProductList';
import Register from './components/Register/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <div>
      <h1>Είμαι το App</h1>
      <Routes>
        <Route path="/" element={<h2>Αρχική Σελίδα</h2>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu/:slug" element={<MenuPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<StoreSelector />} />
          <Route path="menu/:slug" element={<MenuPage />} />
          <Route path="products" element={<ProductList />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;