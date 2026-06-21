import MenuItem from './MenuItem';

export default function MenuList({ items }) {
  return (
    <div>
      {items && items.map(item => (
        <MenuItem 
          key={item.id} 
          name={item.name} 
          description={item.description} 
          price={item.price} 
        />
      ))}
    </div>
  );
}