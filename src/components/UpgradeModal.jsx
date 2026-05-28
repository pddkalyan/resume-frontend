import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '90%', maxWidth: '450px',
        borderRadius: '16px', padding: '40px 30px', border: '1px solid #3b82f6',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)', color: '#fff', textAlign: 'center'
      }}>
        
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
        <h2 style={{ margin: '0 0 15px 0', color: '#60a5fa', fontSize: '28px' }}>Unlock Enterprise Pro</h2>
        
        <p style={{ color: '#cbd5e1', marginBottom: '30px', fontSize: '15px', lineHeight: '1.6' }}>
          You've discovered a Premium feature! Upgrade to Pro to supercharge your job search and stand out to recruiters.
        </p>

        <div style={{ textAlign: 'left', marginBottom: '35px', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>✓</span> 
              <strong>Magic AI Data Extraction</strong>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>✓</span> 
              <strong>1-Click AI Design Cloning</strong>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>✓</span> 
              <strong>Premium Visual Templates</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>✓</span> 
              <strong>Priority ATS Scoring</strong>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
            <button 
                onClick={onClose} 
                style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #64748b', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.target.style.color = '#fff'}
                onMouseOut={(e) => e.target.style.color = '#94a3b8'}
            >
                Maybe Later
            </button>
            <button 
                // --- We will build this /upgrade route next for the Spin the Wheel game! ---
                onClick={() => { onClose(); navigate('/upgrade'); }} 
                style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
                See Pricing & Offers
            </button>
        </div>

      </div>
    </div>
  );
}