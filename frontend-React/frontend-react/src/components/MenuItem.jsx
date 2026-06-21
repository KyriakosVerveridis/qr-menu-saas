export default function MenuItem({ name, description, price }) {
    return (
      <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 5px 0' }}>{name}</h3>
        <p style={{ color: '#666', fontSize: '0.9em' }}>{description}</p>
        <span style={{ fontWeight: 'bold' }}>{price}€</span>
      </div>
    );
  }