import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResumeViewer() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // <-- 1. NEW: State to hold the photo -->
  const [photo, setPhoto] = useState(null); 
  
  const navigate = useNavigate();
  const { id } = useParams();

  // <-- 2. NEW: Fetch the photo from sessionStorage -->
  useEffect(() => {
    const savedPhoto = sessionStorage.getItem('resume_photo');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/');
        return;
      }

      if (!id) {
          setError("No resume ID provided.");
          setLoading(false);
          return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/resumes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setResume(response.data);
        
      } catch (err) {
        setError("Failed to fetch resume data.");
        if (err.response && err.response.status === 403) {
          localStorage.removeItem('jwt_token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading your resume...</div>;
  if (error) return <div style={{ color: '#f87171', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
  if (!resume) return null;

  // --- THE TEMPLATE ENGINE ---
  const themeStyles = {
    modern: {
      fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
      headerBg: '#2b6cb0', 
      headerColor: 'white',
      headerAlign: 'left',
      sectionBorder: '2px solid #2b6cb0',
      titleColor: '#2b6cb0',
      photoStyle: '50%' // Circle for modern
    },
    classic: {
      fontFamily: "'Times New Roman', Times, serif",
      headerBg: 'transparent',
      headerColor: 'black',
      headerAlign: 'center',
      sectionBorder: '1px solid black',
      titleColor: 'black',
      photoStyle: '8px' // Slightly rounded square for classic
    },
    minimalist: {
      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
      headerBg: 'transparent',
      headerColor: '#333',
      headerAlign: 'left',
      sectionBorder: 'none',
      titleColor: '#555',
      photoStyle: '0px' // Sharp square for minimalist
    }
  };

  const activeTheme = themeStyles[resume.selectedTemplate] || themeStyles.modern;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* --- INJECT CSS FOR PRINTING --- */}
      <style>
        {`
          @media print {
            body { background-color: white !important; }
            .no-print { display: none !important; }
            .print-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; }
          }
        `}
      </style>

      {/* --- ACTION BAR --- */}
      <div className="no-print" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          &larr; Back to Dashboard
        </button>
        <button onClick={handlePrint} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🖨️ Export PDF / Print
        </button>
      </div>

      {/* --- THE DYNAMIC A4 RESUME DOCUMENT --- */}
      <div className="print-container" style={{ 
        width: '100%', maxWidth: '800px', backgroundColor: 'white', color: 'black', 
        borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden',
        fontFamily: activeTheme.fontFamily, lineHeight: '1.6'
      }}>
        
        {/* --- 3. UPDATED: Dynamic Header with Photo --- */}
        <div style={{ 
          backgroundColor: activeTheme.headerBg, 
          color: activeTheme.headerColor, 
          padding: '40px', 
          borderBottom: resume.selectedTemplate === 'classic' ? '2px solid black' : 'none',
          display: 'flex', 
          flexDirection: activeTheme.headerAlign === 'center' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: activeTheme.headerAlign === 'center' ? 'center' : 'flex-start',
          gap: '30px'
        }}>
          
          {/* THE PHOTO RENDERER */}
          {photo && (
            <img 
              src={photo} 
              alt="Profile" 
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: activeTheme.photoStyle,
                border: `3px solid ${activeTheme.headerColor === 'white' ? 'white' : '#ccc'}`,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }} 
            />
          )}

          {/* THE TEXT RENDERER */}
          <div style={{ textAlign: activeTheme.headerAlign }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', letterSpacing: '1px' }}>{resume.personalInfo?.fullName || 'Your Name'}</h1>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>
              {resume.personalInfo?.email} • {resume.personalInfo?.phone}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '15px', opacity: 0.9 }}>
              {resume.personalInfo?.linkedInUrl && <span style={{ marginRight: '15px' }}>{resume.personalInfo.linkedInUrl}</span>}
              {resume.personalInfo?.githubUrl && <span>{resume.personalInfo.githubUrl}</span>}
            </p>
          </div>

        </div>

        {/* Dynamic Body Container */}
        <div style={{ padding: '40px' }}>
          
          {/* Skills Section */}
          {resume.skills && resume.skills.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Technical Skills
              </h2>
              <p style={{ margin: 0, fontWeight: '500' }}>{resume.skills.join(' • ')}</p>
            </div>
          )}

          {/* Experience Section */}
          {resume.experience && resume.experience.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Professional Experience
              </h2>
              {resume.experience.map((exp, idx) => (
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

          {/* Projects Section */}
          {resume.projects && resume.projects.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Projects
              </h2>
              {resume.projects.map((proj, idx) => (
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

          {/* Education Section */}
          {resume.education && resume.education.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', color: activeTheme.titleColor, borderBottom: activeTheme.sectionBorder, paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Education
              </h2>
              {resume.education.map((edu, idx) => (
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
    </div>
  );
}