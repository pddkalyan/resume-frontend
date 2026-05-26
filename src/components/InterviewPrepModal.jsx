import React, { useState } from 'react';
import axios from 'axios';

export default function InterviewPrepModal({ isOpen, onClose, resumeData }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qnaList, setQnaList] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ats/interview-prep`,
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
      
      // The backend returns a JSON string, we need to parse it if it isn't already an object
      const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      
      if (responseData.qnaList && Array.isArray(responseData.qnaList)) {
        setQnaList(responseData.qnaList);
      } else {
        throw new Error("Invalid response format from AI.");
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to generate interview prep. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setQnaList(null);
    setJobDescription('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '90%', maxWidth: '800px', maxHeight: '90vh',
        borderRadius: '12px', padding: '30px', overflowY: 'auto', border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff',
        display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#06b6d4' }}>🤖 AI Interview Coach</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {!qnaList ? (
          // --- INPUT PHASE ---
          <div>
            <p style={{ color: '#a0aec0', marginBottom: '20px', lineHeight: '1.5' }}>
              Paste the Job Description below. The AI will analyze this specific resume and generate <strong>10 highly targeted interview questions</strong> along with a personalized strategy on how to answer them.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the Job Description here..."
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
                width: '100%', padding: '15px', backgroundColor: isGenerating ? '#6c757d' : '#06b6d4',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? '⏳ Analyzing Profile & Generating Questions...' : 'Start Mock Interview Prep (1 Credit)'}
            </button>
          </div>
        ) : (
          // --- RESULTS PHASE ---
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#10b981' }}>Your Personalized Prep Guide</h3>
              <button onClick={handleReset} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#a0aec0', border: '1px solid #4a5568', borderRadius: '6px', cursor: 'pointer' }}>
                Start Over
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {qnaList.map((item, index) => (
                <div key={index} style={{ backgroundColor: '#2a2a40', borderRadius: '8px', border: '1px solid #444', overflow: 'hidden' }}>
                  
                  {/* Question Banner */}
                  <div style={{ backgroundColor: '#334155', padding: '15px 20px', borderBottom: '1px solid #444' }}>
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#06b6d4' }}>Q{index + 1}.</span> {item.question}
                    </h4>
                  </div>
                  
                  {/* Answer Strategy */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#10b981', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>
                      💡 Coaching Strategy
                    </div>
                    <p style={{ margin: 0, color: '#e2e8f0', lineHeight: '1.6', fontSize: '15px' }}>
                      {item.answerStrategy}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}