import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Layout/Dashboard';
import StoreList from './components/StoreList';
import Login from './components/Login';
import MenuEditor from './components/Menu/MenuEditor';
import StoreSelector from './components/Stores/StoreSelector';
import MenuPage from './components/MenuPage';
import ProductList from './components/Products/ProductList';
import Register from './components/Register/Register';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div>
      <h1>Είμαι το App</h1>
      <Routes>
        <Route path="/" element={<h2>Αρχική Σελίδα</h2>} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
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