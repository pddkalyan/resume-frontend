import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function MagicImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsExtracting(true);
    setError('');
    const token = localStorage.getItem('jwt_token');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/resumes/extract`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Required for file uploads
        }
      });

      // Parse the JSON safely in case Gemini wrapped it in markdown or returned a string
      let parsedData = response.data;
      if (typeof parsedData === 'string') {
        const cleanedString = parsedData.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanedString);
      }

      onImportSuccess(parsedData);
      setFile(null); // Reset for next time
      onClose();

    } catch (err) {
      console.error("Extraction Error:", err);
      setError('Failed to extract data. Please ensure the file is a readable PDF or Image.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
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
          <h2 style={{ margin: 0, color: '#10b981' }}>🪄 Magic AI Import</h2>
          <button onClick={onClose} disabled={isExtracting} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: isExtracting ? 'not-allowed' : 'pointer' }}>✕</button>
        </div>

        <p style={{ color: '#a0aec0', marginBottom: '25px' }}>
          Upload an old resume (PDF) or a screenshot of your LinkedIn profile. Our AI will extract the text and instantly build your new template!
        </p>

        {/* Drag and Drop Zone */}
        <div 
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
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,image/png,image/jpeg" 
            style={{ display: 'none' }} 
          />
          
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>
            {file ? '📄' : '📁'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: file ? '#10b981' : '#fff' }}>
            {file ? file.name : 'Click or Drag & Drop a file here'}
          </div>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginTop: '5px' }}>
            Supports PDF, PNG, JPG
          </div>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <button 
          onClick={handleExtract}
          disabled={isExtracting || !file}
          style={{
            width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px',
            backgroundColor: isExtracting ? '#6c757d' : (file ? '#10b981' : '#4a5568'),
            color: 'white', cursor: (isExtracting || !file) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
          }}
        >
          {isExtracting ? '🤖 AI is reading your document...' : 'Extract & Auto-Fill'}
        </button>

      </div>
    </div>
  );
}