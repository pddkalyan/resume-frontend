import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatusPopup from './StatusPopup';

// Pull the URL from Vite's environment variables. 
// Adding a fallback to localhost ensures it doesn't crash if the .env is missing.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [status, setStatus] = useState({ message: '', type: '' }); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        // 1. Replaced hardcoded URL with dynamic environment variable
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
            onClick={() => navigate('/resume-builder')} 
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}
          >
            + Create New Resume
          </button>
          <button 
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
              <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                {resume.title || 'Untitled Document'}
              </h3>
              <p style={{ margin: '0 0 5px 0', color: '#94a3b8' }}>
                <strong>Profile:</strong> {resume.personalInfo?.fullName || 'No Name'}
              </p>
              <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px' }}>
                <strong>ID:</strong> {resume.id.substring(0, 8)}...
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '15px' }}>
              <button 
                onClick={() => navigate(`/resume-viewer/${resume.id}`)} 
                style={{ padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                View
              </button>
              
              <button 
                onClick={() => navigate(`/resume-builder/${resume.id}`)} 
                style={{ padding: '8px', backgroundColor: '#eab308', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Edit
              </button>

              <button 
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete "${resume.title || 'this resume'}"?`)) {
                    const token = localStorage.getItem('jwt_token');
                    try {
                      // 2. Replaced hardcoded URL with dynamic environment variable
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

    </div>
  );
}