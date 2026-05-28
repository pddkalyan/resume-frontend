import React, { useState, useRef } from 'react';
import axios from 'axios';
import UpgradeModal from './UpgradeModal'; 

export default function MagicImportModal({ isOpen, onClose, onImportSuccess, onCloneSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processType, setProcessType] = useState(''); 
  const [error, setError] = useState('');
  
  // --- NEW: Control state for the paywall modal ---
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); 
  
  const fileInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
    }
  };

  const handleProcess = async (type) => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setProcessType(type);
    setError('');
    const token = localStorage.getItem('jwt_token');

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (type === 'DATA') {
        const response = await axios.post(`${API_BASE_URL}/api/resumes/extract`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });

        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          const cleanedString = parsedData.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleanedString);
        }
        onImportSuccess(parsedData);

      } else if (type === 'DESIGN') {
        const response = await axios.post(`${API_BASE_URL}/api/resumes/clone-design`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        
        if(onCloneSuccess) {
            onCloneSuccess(response.data);
        }
      }

      setFile(null);
      onClose();

    } catch (err) {
      console.error("Extraction Error:", err);
      
      // --- INTERCEPT THE PAYWALL ERROR ---
      if (err.response && err.response.data && err.response.data.error === 'PREMIUM_REQUIRED') {
          setShowUpgradeModal(true);
      } else {
          setError(`Failed to process ${type === 'DATA' ? 'data' : 'design'}. Ensure the file is readable.`);
      }
      
    } finally {
      setIsProcessing(false);
      setProcessType('');
    }
  };

  return (
    <>
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1e1e2f', width: '90%', maxWidth: '600px',
            borderRadius: '12px', padding: '30px', border: '1px solid #444',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', textAlign: 'center'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#10b981' }}>🪄 Magic AI Assistant</h2>
              <button title="Close AI Assistant" onClick={onClose} disabled={isProcessing} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>✕</button>
            </div>

            <p style={{ color: '#a0aec0', marginBottom: '25px' }}>
              Upload a resume (PDF) or a screenshot. Tell our AI whether you want to extract your text data, or visually clone the design!
            </p>

            {/* Drag and Drop Zone with Tooltip */}
            <div 
              title="Click to browse your computer, or drag a PDF/Image file directly into this box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              style={{
                border: `2px dashed ${file ? '#10b981' : '#4a5568'}`,
                borderRadius: '10px', padding: '40px 20px', cursor: 'pointer',
                backgroundColor: '#2a2a40', transition: 'all 0.2s ease',
                marginBottom: '20px'
              }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/png,image/jpeg" style={{ display: 'none' }} />
              
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{file ? '📄' : '📁'}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: file ? '#10b981' : '#fff' }}>
                {file ? file.name : 'Click or Drag & Drop a file here'}
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button 
                    title="Let AI read your PDF and automatically fill in your experience, skills, and education."
                    onClick={() => handleProcess('DATA')}
                    disabled={isProcessing || (!file && !isProcessing)} 
                    style={{
                        padding: '15px', borderRadius: '8px', border: '1px solid #10b981', fontWeight: 'bold', fontSize: '15px',
                        backgroundColor: isProcessing && processType === 'DATA' ? '#6c757d' : 'transparent',
                        color: isProcessing && processType === 'DATA' ? 'white' : (!file ? '#6c757d' : '#10b981'), 
                        cursor: (isProcessing || !file) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {isProcessing && processType === 'DATA' ? '🤖 Auto-filling...' : '📝 Auto-Fill Data'}
                </button>

                <button 
                    title="Upload an image of a resume you like, and our AI will recreate the exact HTML layout for you."
                    onClick={() => handleProcess('DESIGN')}
                    disabled={isProcessing || (!file && !isProcessing)}
                    style={{
                        padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '15px',
                        backgroundColor: isProcessing && processType === 'DESIGN' ? '#6c757d' : (file ? '#8b5cf6' : '#4a5568'),
                        color: isProcessing && processType === 'DESIGN' ? 'white' : (!file ? '#9ca3af' : 'white'), 
                        cursor: (isProcessing || !file) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {isProcessing && processType === 'DESIGN' ? '🎨 Cloning...' : '🎨 Clone Design'}
                </button>
            </div>
          </div>
        </div>

        {/* RENDER THE UPGRADE MODAL ON TOP IF TRIGGERED */}
        <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => {
                setShowUpgradeModal(false);
                onClose(); 
            }} 
        />
    </>
  );
}