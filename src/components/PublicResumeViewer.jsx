import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getLayoutComponent } from './layouts/LayoutRegistry';

export default function PublicResumeViewer() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [templateConfig, setTemplateConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchPublicResume = async () => {
      setIsLoading(true);
      try {
        // 1. Hit the Unauthenticated Endpoint for the Resume Data
        const resResponse = await axios.get(`${API_BASE_URL}/api/resumes/public/${shareCode}`);
        const publicResume = resResponse.data;
        setResumeData(publicResume);

        // 2. Fetch the specific template config without throwing a 403 error
        if (publicResume.selectedTemplate) {
            try {
                // Ensure your Spring Boot SecurityConfig permits /api/templates/public/**
                const tplResponse = await axios.get(`${API_BASE_URL}/api/templates/public/${publicResume.selectedTemplate}`);
                setTemplateConfig(tplResponse.data);
            } catch (tplErr) {
                console.warn("Custom template not found or not public, falling back to default layout.");
                setTemplateConfig({ baseComponent: 'ModernLayout' });
            }
        } else {
            setTemplateConfig({ baseComponent: 'ModernLayout' });
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        if (err.response && err.response.status === 403) {
            setError('This resume is no longer available publicly.');
        } else if (err.response && err.response.status === 404) {
            setError('Resume not found or invalid link.');
        } else {
            setError('Failed to load document.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicResume();
  }, [shareCode, API_BASE_URL]);

  if (isLoading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading rendering engine...</div>;
  if (error) return (
    <div style={{ backgroundColor: '#1e1e2f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</h2>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Return to Homepage</button>
    </div>
  );

  const LayoutComponent = getLayoutComponent(templateConfig.baseComponent);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Branding Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
            Powered by Enterprise Resume Builder
        </p>
      </div>

      <div style={{
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        backgroundColor: 'white',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '794px' // Max width for A4
      }}>
        <div style={{ width: '100%', minHeight: '1123px', backgroundColor: 'white' }}>
          <LayoutComponent resumeData={resumeData} config={templateConfig?.config} />
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
              Create Your Own Pro Resume
          </button>
      </div>
    </div>
  );
}