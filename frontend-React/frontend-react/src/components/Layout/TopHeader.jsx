import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';

export default function TopHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { clearRestaurant } = useRestaurant();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    clearRestaurant();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-4 md:px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:text-slate-900 text-2xl leading-none"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-slate-900">My App</h1>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
      >
        Αποσύνδεση
      </button>
    </div>
  );
}