export default function StatusPopup({ message, type, onClose }) {
  if (!message) return null;

  const bgColor = type === 'success' ? '#28a745' : '#dc3545';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px',
        textAlign: 'center', border: `2px solid ${bgColor}`,
        width: '300px'
      }}>
        <h3 style={{ color: type === 'success' ? '#4ade80' : '#f87171' }}>
          {type === 'success' ? 'Success!' : 'Error'}
        </h3>
        <p>{message}</p>
        <button 
          onClick={onClose}
          style={{ 
            marginTop: '20px', padding: '10px 20px', backgroundColor: bgColor, 
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' 
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}