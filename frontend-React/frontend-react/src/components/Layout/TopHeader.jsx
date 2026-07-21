import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';

export default function TopHeader() {
  const navigate = useNavigate();
  const { clearRestaurant } = useRestaurant();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    clearRestaurant();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4">
      <h1 className="text-lg font-semibold text-slate-900">My App</h1>
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
      >
        Αποσύνδεση
      </button>
    </div>
  );
}