import React, { useState } from 'react';
import axios from 'axios';

export default function AtsScannerModal({ isOpen, onClose, resumeData }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    setIsScanning(true);
    setError('');
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ats/scan`,
        {
          resumeData: JSON.stringify(resumeData),
          jobDescription: jobDescription
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Parse if backend returns a stringified JSON
      const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setScanResult(parsedData);
      
    } catch (err) {
      console.error(err);
      setError('Failed to scan resume. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '90%', maxWidth: '700px', maxHeight: '90vh',
        borderRadius: '12px', padding: '30px', overflowY: 'auto', border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#8b5cf6' }}>✨ Pro ATS Scanner</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {!scanResult ? (
          <div>
            <p style={{ color: '#a0aec0', marginBottom: '20px' }}>
              Paste the target Job Description below. Our AI will analyze your resume against the JD and find missing keywords.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here..."
              style={{
                width: '100%', height: '200px', padding: '15px', borderRadius: '8px',
                backgroundColor: '#2a2a40', border: '1px solid #444', color: '#fff',
                fontSize: '15px', resize: 'vertical', marginBottom: '15px', boxSizing: 'border-box'
              }}
            />
            
            {error && <p style={{ color: '#ef4444', marginTop: 0 }}>{error}</p>}
            
            <button 
              onClick={handleScan}
              disabled={isScanning}
              style={{
                width: '100%', padding: '15px', backgroundColor: isScanning ? '#6c757d' : '#8b5cf6',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: isScanning ? 'not-allowed' : 'pointer'
              }}
            >
              {isScanning ? '⏳ Running ATS Scan...' : 'Run Scan (1 Credit)'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: scanResult.matchPercentage > 75 ? '#10b981' : (scanResult.matchPercentage > 40 ? '#f59e0b' : '#ef4444') }}>
                {scanResult.matchPercentage}%
              </div>
              <div style={{ color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>Match Score</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ef4444', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Missing Keywords to Add:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {scanResult.missingKeywords?.map((kw, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', border: '1px solid #ef4444' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ color: '#10b981', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Matching Keywords Found:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {scanResult.matchingKeywords?.map((kw, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', border: '1px solid #10b981' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setScanResult(null)} 
              style={{ width: '100%', padding: '15px', backgroundColor: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '8px', cursor: 'pointer', marginTop: '30px' }}
            >
              Scan Another Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}