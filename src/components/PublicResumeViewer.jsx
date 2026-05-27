import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
        const resResponse = await axios.get(`${API_BASE_URL}/api/resumes/public/${shareCode}`);
        const publicResume = resResponse.data;
        setResumeData(publicResume);

        if (publicResume.selectedTemplate) {
            try {
                const tplResponse = await axios.get(`${API_BASE_URL}/api/templates/public/${publicResume.selectedTemplate}`);
                setTemplateConfig(tplResponse.data.config || tplResponse.data);
            } catch (tplErr) {
                console.warn("Custom template not found, falling back.");
                setTemplateConfig(null);
            }
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
  if (!resumeData) return null;

  // --- THE TEMPLATE ENGINE (Matching your Private Viewer exactly) ---
  const legacyThemeStyles = {
    modern: {
      fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
      headerBg: '#2b6cb0', 
      headerColor: 'white',
      headerAlign: 'left',
      sectionBorder: '2px solid #2b6cb0',
      titleColor: '#2b6cb0',
      photoStyle: '50%'
    },
    classic: {
      fontFamily: "'Times New Roman', Times, serif",
      headerBg: 'transparent',
      headerColor: 'black',
      headerAlign: 'center',
      sectionBorder: '1px solid black',
      titleColor: 'black',
      photoStyle: '8px'
    },
    minimalist: {
      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
      headerBg: 'transparent',
      headerColor: '#333',
      headerAlign: 'left',
      sectionBorder: 'none',
      titleColor: '#555',
      photoStyle: '0px'
    }
  };

  let activeTheme;
  if (templateConfig) {
      activeTheme = {
          fontFamily: templateConfig.fontFamily || "'Segoe UI', sans-serif",
          headerBg: templateConfig.primaryColor || '#2b6cb0',
          headerColor: 'white',
          headerAlign: templateConfig.layoutStyle === 'single-column-centered' ? 'center' : 'left',
          sectionBorder: `2px solid ${templateConfig.primaryColor || '#2b6cb0'}`,
          titleColor: templateConfig.primaryColor || '#2b6cb0',
          photoStyle: '50%' 
      };
  } else {
      activeTheme = legacyThemeStyles[resumeData.selectedTemplate] || legacyThemeStyles.modern;
  }

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
        color: 'black',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '800px', // Match private viewer
        fontFamily: activeTheme.fontFamily, 
        lineHeight: '1.6',
        borderRadius: '8px'
      }}>
        
        <div style={{ 
          backgroundColor: activeTheme.headerBg, 
          color: activeTheme.headerColor, 
          padding: '40px', 
          borderBottom: resumeData.selectedTemplate === 'classic' ? '2px solid black' : 'none',
          display: 'flex', 
          flexDirection: activeTheme.headerAlign === 'center' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: activeTheme.headerAlign === 'center' ? 'center' : 'flex-start',
          gap: '30px'
        }}>
          
          <div style={{ textAlign: activeTheme.headerAlign }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', letterSpacing: '1px' }}>{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>
              {resumeData.personalInfo?.email} • {resumeData.personalInfo?.phone}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '15px', opacity: 0.9 }}>
              {resumeData.personalInfo?.linkedInUrl && <span style={{ marginRight: '15px' }}>{resumeData.personalInfo.linkedInUrl}</span>}
              {resumeData.personalInfo?.githubUrl && <span>{resumeData.personalInfo.githubUrl}</span>}
            </p>
          </div>
        </div>

        <div style={{ padding: '40px' }}>
          
          {resumeData.skills && resumeData.skills.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Technical Skills
              </h2>
              <p style={{ margin: 0, fontWeight: '500' }}>{resumeData.skills.join(' • ')}</p>
            </div>
          )}

          {resumeData.experience && resumeData.experience.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Professional Experience
              </h2>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{exp.role}</h3>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{exp.duration}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>{exp.company}</div>
                  <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.projects && resumeData.projects.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Projects
              </h2>
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{proj.title}</h3>
                    <span style={{ fontSize: '14px' }}>{proj.technologiesUsed}</span>
                  </div>
                  {proj.link && <a href={proj.link} style={{ fontSize: '13px', color: '#0056b3', textDecoration: 'none' }}>{proj.link}</a>}
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.education && resumeData.education.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Education
              </h2>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{edu.institution}</h3>
                    <div style={{ fontSize: '14px' }}>{edu.degree} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          )}

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