import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusPopup from './StatusPopup';
import ShareModal from './ShareModal'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [status, setStatus] = useState({ message: '', type: '' }); 
  
  const [activeShareResume, setActiveShareResume] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/resumes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setResumes(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          localStorage.removeItem('jwt_token');
          navigate('/');
        } else {
          setError('Failed to load resumes. Is the backend running?');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '30px', color: '#fff' }}>
      
      {/* --- INJECT CSS FOR BLINKING EFFECT --- */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.2; }
            100% { opacity: 1; }
          }
        `}
      </style>

      <StatusPopup 
        message={status.message} 
        type={status.type} 
        onClose={() => setStatus({ message: '', type: '' })} 
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', backgroundColor: '#1e1e2f', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>My Resumes</h1>
          <p style={{ margin: '5px 0 0 0', color: '#cbd5e1' }}>Manage and export your documents</p>
        </div>
        <div>
          <button 
            title="Start building a new resume from scratch or using Magic Import"
            onClick={() => navigate('/resume-builder')} 
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}
          >
            + Create New Resume
          </button>
          <button 
            title="Sign out of your account"
            onClick={handleLogout} 
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <div style={{ textAlign: 'center', fontSize: '18px' }}>Loading your documents...</div>}
      {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '15px', borderRadius: '8px', border: '1px solid #ef4444' }}>{error}</div>}

      {/* Resume Grid */}
      {!loading && !error && resumes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#1e1e2f', borderRadius: '12px' }}>
          <h3>No resumes found.</h3>
          <p style={{ color: '#cbd5e1' }}>Click the green button above to build your first one!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {resumes.map((resume) => (
          <div key={resume.id} style={{ backgroundColor: '#1e1e2f', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'white' }}>
                  {resume.title || 'Untitled Document'}
                </h3>
                
                {/* --- FIX: SEPARATED TOOLTIPS FOR VIEWS AND LIVE DOT --- */}
                {(resume.public || resume.isPublic) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span 
                      title="Total views from your public share link"
                      style={{ fontSize: '12px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '4px 8px', borderRadius: '6px', cursor: 'help' }}
                    >
                        👁️ {resume.viewCount || 0} views
                    </span>
                    <span 
                      title="This resume is currently accessible via your public share link"
                      style={{ fontSize: '12px', backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'help' }}
                    >
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                        Live
                    </span>
                  </div>
                )}
              </div>

              <p style={{ margin: '0 0 5px 0', color: '#94a3b8' }}>
                <strong>Profile:</strong> {resume.personalInfo?.fullName || 'No Name'}
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px' }}>
                <strong>ID:</strong> {resume.id.substring(0, 8)}...
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '15px' }}>
              <button 
                title="Preview the rendered resume and export it to PDF"
                onClick={() => navigate(`/resume-viewer/${resume.id}`)} 
                style={{ padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                View
              </button>
              
              <button 
                title="Update your skills, experience, or change the template"
                onClick={() => navigate(`/resume-builder/${resume.id}`)} 
                style={{ padding: '8px', backgroundColor: '#eab308', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Edit
              </button>

              <button 
                title="Generate a public link to share with recruiters online"
                onClick={() => setActiveShareResume(resume)} 
                style={{ padding: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Share
              </button>

              <button 
                title="Permanently delete this resume from the database"
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete "${resume.title || 'this resume'}"?`)) {
                    const token = localStorage.getItem('jwt_token');
                    try {
                      await axios.delete(`${API_BASE_URL}/api/resumes/${resume.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      setResumes(resumes.filter(r => r.id !== resume.id));
                      setStatus({ message: 'Resume deleted successfully!', type: 'success' });
                    } catch (err) {
                      setStatus({ message: 'Failed to delete the document. Please try again.', type: 'error' });
                    }
                  }
                }} 
                style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

      <ShareModal 
          isOpen={!!activeShareResume}
          onClose={() => {
              setActiveShareResume(null);
              window.location.reload(); 
          }}
          resumeId={activeShareResume?.id}
          initialIsPublic={activeShareResume?.public !== undefined ? activeShareResume.public : activeShareResume?.isPublic}
          initialShareCode={activeShareResume?.shareCode}
      />

    </div>
  );
}