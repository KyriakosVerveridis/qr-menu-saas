import { createContext, useContext, useState } from 'react';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem('active_store_id') || null);

  const updateRestaurant = (id) => {
    setRestaurantId(id);
    localStorage.setItem('active_store_id', id);
  };

  const clearRestaurant = () => {
    setRestaurantId(null);
    localStorage.removeItem('active_store_id');
  };

  return (
    <RestaurantContext.Provider value={{ restaurantId, updateRestaurant, clearRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);