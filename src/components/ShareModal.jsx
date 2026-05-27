import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShareModal({ isOpen, onClose, resumeId, initialIsPublic, initialShareCode }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [shareCode, setShareCode] = useState(initialShareCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  // Dynamically get the current domain (e.g., http://localhost:5173 or https://your-saas.com)
  const appDomain = window.location.origin; 

  // Sync state if props change when opening the modal
  useEffect(() => {
    setIsPublic(initialIsPublic || false);
    setShareCode(initialShareCode || '');
    setCopySuccess(false);
    setError('');
  }, [isOpen, initialIsPublic, initialShareCode]);

  if (!isOpen) return null;

  const handleToggleShare = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('jwt_token');

    try {
      // Hit the PUT endpoint we just built in Spring Boot
      const response = await axios.put(`${API_BASE_URL}/api/resumes/${resumeId}/share`, 
        { isPublic: !isPublic }, // Toggle the current state
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setIsPublic(response.data.isPublic);
      setShareCode(response.data.shareCode);
    } catch (err) {
      console.error(err);
      setError('Failed to update sharing settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareCode) return;
    const fullLink = `${appDomain}/v/${shareCode}`;
    
    // Native browser clipboard API
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '90%', maxWidth: '500px', borderRadius: '12px', 
        padding: '30px', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔗 Share Resume
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <div style={{ backgroundColor: '#2a2a40', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Public Link</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#a0aec0' }}>
                        Allow anyone with the link to view this resume.
                    </p>
                </div>
                
                {/* The Toggle Switch Button */}
                <button 
                    onClick={handleToggleShare}
                    disabled={isLoading}
                    style={{
                        padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer',
                        backgroundColor: isPublic ? '#10b981' : '#4b5563', color: 'white', transition: 'all 0.2s'
                    }}
                >
                    {isLoading ? '...' : (isPublic ? 'Live ON' : 'Live OFF')}
                </button>
            </div>

            {/* The Link Copy Area (Only shows if public) */}
            {isPublic && shareCode && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        readOnly 
                        value={`${appDomain}/v/${shareCode}`}
                        style={{ 
                            flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #3b82f6', 
                            backgroundColor: '#1e1e2f', color: '#10b981', fontSize: '14px', outline: 'none' 
                        }} 
                    />
                    <button 
                        onClick={handleCopyLink}
                        style={{ 
                            padding: '10px 20px', backgroundColor: copySuccess ? '#10b981' : '#3b82f6', 
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' 
                        }}
                    >
                        {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            )}
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Your data is secure. If you turn the link OFF, anyone visiting the old URL will be blocked immediately.
        </p>

      </div>
    </div>
  );
}