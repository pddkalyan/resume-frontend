import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TemplateGalleryModal({ isOpen, onClose, currentTemplateId, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDomain, setActiveDomain] = useState('All');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isOpen) return;

    const fetchTemplates = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      try {
        const response = await axios.get(`${API_BASE_URL}/api/templates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTemplates(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load template catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isOpen, API_BASE_URL]);

  if (!isOpen) return null;

  // Extract unique domains for the filter pills
  const allDomains = ['All', ...new Set(templates.flatMap(t => t.domains || []))];
  
  // Filter templates based on selected pill
  const displayedTemplates = activeDomain === 'All' 
    ? templates 
    : templates.filter(t => t.domains?.includes(activeDomain));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '95%', maxWidth: '1000px', height: '85vh',
        borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #333', backgroundColor: '#2a2a40' }}>
          <h2 style={{ margin: 0, color: '#3b82f6' }}>🎨 Template Gallery</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Filter Pills */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #333', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {allDomains.map(domain => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap',
                backgroundColor: activeDomain === domain ? '#3b82f6' : '#33334d',
                color: activeDomain === domain ? 'white' : '#a0aec0',
                transition: 'all 0.2s'
              }}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div style={{ padding: '30px', overflowY: 'auto', flexGrow: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: '50px' }}>Loading templates...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
              
              {displayedTemplates.map(template => {
                const isActive = currentTemplateId === template.templateId;
                
                return (
                  <div key={template.id} style={{
                    backgroundColor: '#2a2a40', borderRadius: '10px', overflow: 'hidden', 
                    border: isActive ? '2px solid #10b981' : '1px solid #444',
                    transition: 'transform 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                      <img 
                        src={template.thumbnailUrl} 
                        alt={template.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      {template.pro && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#f59e0b', color: 'black', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                          PRO
                        </div>
                      )}
                    </div>
                    
                    {/* Details & Action */}
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{template.name}</h3>
                      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#a0aec0' }}>
                        {template.domains?.slice(0, 2).join(', ')}
                      </p>
                      
                      <button 
                        onClick={() => {
                           onSelectTemplate(template.templateId);
                           onClose();
                        }}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                          backgroundColor: isActive ? '#10b981' : '#3b82f6', color: 'white'
                        }}
                      >
                        {isActive ? '✓ Current Template' : 'Use This Template'}
                      </button>
                    </div>
                  </div>
                );
              })}
              
            </div>
          )}
        </div>

      </div>
    </div>
  );
}