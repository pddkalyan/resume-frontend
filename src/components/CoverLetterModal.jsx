import React, { useState } from 'react';
import axios from 'axios';

export default function CoverLetterModal({ isOpen, onClose, resumeData }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState('');
  const [copyText, setCopyText] = useState('📋 Copy to Clipboard');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCopyText('📋 Copy to Clipboard'); 
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ats/cover-letter`,
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
      
      setCoverLetter(response.data.coverLetter || response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate the cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopyText('✅ Copied!');
      setTimeout(() => setCopyText('📋 Copy to Clipboard'), 2000);
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
          <h2 style={{ margin: 0, color: '#f59e0b' }}>✍️ AI Cover Letter Writer</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {!coverLetter ? (
          <div>
            <p style={{ color: '#a0aec0', marginBottom: '20px' }}>
              Paste the Job Description below. Our AI will analyze your resume and draft a highly tailored, persuasive cover letter instantly.
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
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: '100%', padding: '15px', backgroundColor: isGenerating ? '#6c757d' : '#f59e0b',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? '⏳ Drafting Cover Letter...' : 'Generate Cover Letter (1 Credit)'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#10b981' }}>Success! Here is your draft:</h3>
              <button 
                onClick={handleCopy}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {copyText}
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: '#2a2a40', padding: '20px', borderRadius: '8px', 
              border: '1px solid #444', whiteSpace: 'pre-wrap', lineHeight: '1.6', 
              fontSize: '15px', color: '#e2e8f0' 
            }}>
              {coverLetter}
            </div>

            <button 
              onClick={() => setCoverLetter(null)} 
              style={{ width: '100%', padding: '15px', backgroundColor: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}
            >
              Draft Another Letter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}