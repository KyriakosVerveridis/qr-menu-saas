import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Layout/Dashboard';
import Login from './components/Login';
import StoreSelector from './components/Stores/StoreSelector';
import MenuPage from './components/MenuPage';
import ProductList from './components/Products/ProductList';
import Register from './components/Register/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Onboarding from './components/Onboarding/Onboarding';

function App() {
  return (
    <Routes>
      <Route path="/" element={<h2>Αρχική Σελίδα</h2>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu/:slug" element={<MenuPage />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
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
  );
}

export default App;