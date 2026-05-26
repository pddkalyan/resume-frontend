import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import StatusPopup from './StatusPopup';
import AtsScannerModal from './AtsScannerModal'; 
import CoverLetterModal from './CoverLetterModal';

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [isFetching, setIsFetching] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('My Full Stack Resume');
  const [personalInfo, setPersonalInfo] = useState({ 
    fullName: '', email: '', phone: '', linkedInUrl: '', githubUrl: '' 
  });
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', description: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', graduationYear: '', gpa: '' }]);
  const [projects, setProjects] = useState([{ title: '', description: '', technologiesUsed: '', link: '' }]);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [draggedItem, setDraggedItem] = useState({ index: null, type: null });

  // --- Modal States ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState(id || null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem('resume_photo');
    if (savedPhoto) {
      setPhotoPreview(savedPhoto);
    }

    if (id) {
      const fetchExistingResume = async () => {
        setIsFetching(true);
        const token = localStorage.getItem('jwt_token');
        
        try {
          const response = await axios.get(`${API_BASE_URL}/api/resumes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const existingData = response.data.find(r => r.id === id);
          
          if (existingData) {
            setTitle(existingData.title || '');
            setSelectedTemplate(existingData.selectedTemplate || 'modern');
            setPersonalInfo(existingData.personalInfo || { fullName: '', email: '', phone: '', linkedInUrl: '', githubUrl: '' });
            setSkills(existingData.skills ? existingData.skills.join(', ') : '');
            
            if (existingData.experience && existingData.experience.length > 0) setExperience(existingData.experience);
            if (existingData.education && existingData.education.length > 0) setEducation(existingData.education);
            if (existingData.projects && existingData.projects.length > 0) setProjects(existingData.projects);
          }
        } catch (error) {
          console.error("Fetch Error Details:", error.response || error);
          setSaveStatus({ message: 'Failed to load existing resume data.', type: 'error' });
          setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchExistingResume();
    }
  }, [id, API_BASE_URL]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        sessionStorage.setItem('resume_photo', compressedBase64);
        setPhotoPreview(compressedBase64);
        
        setSaveStatus({ message: 'Photo attached securely!', type: 'success' });
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 2000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    sessionStorage.removeItem('resume_photo');
    setPhotoPreview(null);
  };

  const handleArrayChange = (setter, stateArray, index, field, value) => {
    const updatedArray = [...stateArray];
    updatedArray[index][field] = value;
    setter(updatedArray);
  };

  const handleAddArrayItem = (setter, stateArray, emptyItem) => {
    setter([...stateArray, emptyItem]);
  };

  const handleDrop = (e, targetIndex, stateArray, setter, listType) => {
    e.preventDefault(); 
    if (draggedItem.index === null || draggedItem.index === targetIndex || draggedItem.type !== listType) return;

    const newArray = [...stateArray];
    const draggedItemData = newArray.splice(draggedItem.index, 1)[0];
    newArray.splice(targetIndex, 0, draggedItemData);
    
    setter(newArray);
    setDraggedItem({ index: null, type: null }); 
  };

  const handleLogout = () => {
    sessionStorage.removeItem('resume_photo'); 
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  // --- RESTORED & BULLETPROOF SAVE LOGIC ---
  const handleSaveResume = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ message: '', type: '' }); // Clear any existing toasts

    const token = localStorage.getItem('jwt_token');

    const payload = {
      title: title,
      selectedTemplate: selectedTemplate,
      personalInfo: personalInfo,
      skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      experience: experience,
      education: education,
      projects: projects
    };

    try {
      let response;
      if (id) {
        response = await axios.put(`${API_BASE_URL}/api/resumes/${id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        setSaveStatus({ message: `Success! Resume updated.`, type: 'success' });
        setSavedResumeId(id); 
      } else {
        response = await axios.post(`${API_BASE_URL}/api/resumes`, payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        setSaveStatus({ message: `Success! New resume saved.`, type: 'success' });
        setSavedResumeId(response.data.id); 
        window.history.replaceState(null, '', `/resume-builder/${response.data.id}`);
      }

      // The exact 2-second timing logic for the UX flow
      setTimeout(() => {
        setSaveStatus({ message: '', type: '' }); // 1. Hide the green success toast
        setShowSuccessModal(true);                // 2. Open the Action Modal
      }, 2000);

    } catch (error) {
      if (error.response && error.response.status === 403) {
        setSaveStatus({ message: 'Session expired. Please log in again.', type: 'error' });
        handleLogout();
      } else {
        setSaveStatus({ message: 'Failed to save resume. Please try again.', type: 'error' });
        // Auto-hide error so it doesn't get stuck on screen
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const sectionStyle = { padding: '20px', backgroundColor: '#2a2a40', borderRadius: '8px', marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#1e1e2f', color: '#fff' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };

  if (isFetching) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading document data...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: '#1e1e2f', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', position: 'relative' }}>
      
      <StatusPopup 
        message={saveStatus.message} 
        type={saveStatus.type} 
        onClose={() => setSaveStatus({ message: '', type: '' })} 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>📝 Enterprise Resume Builder {id && <span style={{fontSize: '14px', color: '#eab308'}}>(Edit Mode)</span>}</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
            Dashboard
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowCoverLetterModal(true)} 
            style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}
          >
            ✍️ AI Cover Letter
          </button>

          <button 
            type="button" 
            onClick={() => setShowAtsModal(true)} 
            style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}
          >
            ✨ Pro ATS Scan
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              if (id) {
                navigate(`/resume-viewer/${id}`);
              } else {
                setSaveStatus({ message: 'Please save the resume first before viewing!', type: 'error' });
                setTimeout(() => setSaveStatus({ message: '', type: '' }), 2000);
              }
            }} 
            style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
          >
            View Resume
          </button>

          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <form onSubmit={handleSaveResume}>
        
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Document Info</h3>
          <div style={gridStyle}>
            <div>
              <label>Resume Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label>Design Template</label>
              <select 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value)} 
                style={inputStyle}
              >
                <option value="modern">Modern (Sleek & Professional)</option>
                <option value="classic">Classic (Traditional & Formal)</option>
                <option value="minimalist">Minimalist (Clean & Spacious)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Profile Photo (Optional)
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal' }}>
              🔒 Privacy First: Photos are processed locally.
            </span>
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
            <input 
              type="file" 
              accept="image/*" 
              id="photo-upload" 
              style={{ display: 'none' }} 
              onChange={handlePhotoUpload} 
            />
            
            {photoPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                  src={photoPreview} 
                  alt="Profile Preview" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} 
                />
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label 
                htmlFor="photo-upload" 
                style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Select Photo
              </label>
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Personal Details</h3>
          <div style={gridStyle}>
            <div><label>Full Name</label><input type="text" value={personalInfo.fullName} onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})} style={inputStyle} /></div>
            <div><label>Email Address</label><input type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})} style={inputStyle} /></div>
            <div><label>Phone Number</label><input type="text" value={personalInfo.phone} onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})} style={inputStyle} /></div>
            <div><label>LinkedIn URL</label><input type="text" value={personalInfo.linkedInUrl} onChange={(e) => setPersonalInfo({...personalInfo, linkedInUrl: e.target.value})} style={inputStyle} /></div>
            <div style={{ gridColumn: 'span 2' }}><label>GitHub URL</label><input type="text" value={personalInfo.githubUrl} onChange={(e) => setPersonalInfo({...personalInfo, githubUrl: e.target.value})} style={inputStyle} /></div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Technical Skills</h3>
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Work Experience</h3>
          {experience.map((exp, index) => (
            <div 
              key={index} 
              draggable={experience.length > 1}
              onDragStart={() => setDraggedItem({ index, type: 'experience' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, experience, setExperience, 'experience')}
              style={{ 
                marginBottom: '20px', padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'experience' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px', border: '1px dashed #555',
                cursor: experience.length > 1 ? 'grab' : 'default',
                opacity: draggedItem.index === index && draggedItem.type === 'experience' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: experience.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                {experience.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Experiences">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder</span>
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕ Remove
                </button>
              </div>

              <div style={gridStyle}>
                <div><label>Company</label><input type="text" value={exp.company} onChange={(e) => handleArrayChange(setExperience, experience, index, 'company', e.target.value)} style={inputStyle} /></div>
                <div><label>Role</label><input type="text" value={exp.role} onChange={(e) => handleArrayChange(setExperience, experience, index, 'role', e.target.value)} style={inputStyle} /></div>
                <div style={{ gridColumn: 'span 2' }}><label>Duration</label><input type="text" placeholder="e.g., Jan 2022 - Present" value={exp.duration} onChange={(e) => handleArrayChange(setExperience, experience, index, 'duration', e.target.value)} style={inputStyle} /></div>
              </div>
              <label style={{ display: 'block', marginTop: '10px' }}>Description</label>
              <textarea value={exp.description} onChange={(e) => handleArrayChange(setExperience, experience, index, 'description', e.target.value)} style={{ ...inputStyle, minHeight: '100px' }} />
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem(setExperience, experience, { company: '', role: '', duration: '', description: '' })} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Experience</button>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Education</h3>
          {education.map((edu, index) => (
            <div 
              key={index} 
              draggable={education.length > 1}
              onDragStart={() => setDraggedItem({ index, type: 'education' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, education, setEducation, 'education')}
              style={{ 
                marginBottom: '20px', padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'education' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px', border: '1px dashed #555',
                cursor: education.length > 1 ? 'grab' : 'default',
                opacity: draggedItem.index === index && draggedItem.type === 'education' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: education.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                {education.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Educations">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder</span>
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => setEducation(education.filter((_, i) => i !== index))}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕ Remove
                </button>
              </div>

              <div style={gridStyle}>
                <div><label>Institution</label><input type="text" value={edu.institution} onChange={(e) => handleArrayChange(setEducation, education, index, 'institution', e.target.value)} style={inputStyle} /></div>
                <div><label>Degree</label><input type="text" value={edu.degree} onChange={(e) => handleArrayChange(setEducation, education, index, 'degree', e.target.value)} style={inputStyle} /></div>
                <div><label>Graduation Year</label><input type="text" value={edu.graduationYear} onChange={(e) => handleArrayChange(setEducation, education, index, 'graduationYear', e.target.value)} style={inputStyle} /></div>
                <div><label>GPA / Score</label><input type="text" value={edu.gpa} onChange={(e) => handleArrayChange(setEducation, education, index, 'gpa', e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem(setEducation, education, { institution: '', degree: '', graduationYear: '', gpa: '' })} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Education</button>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Projects</h3>
          {projects.map((proj, index) => (
            <div 
              key={index} 
              draggable={projects.length > 1}
              onDragStart={() => setDraggedItem({ index, type: 'projects' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, projects, setProjects, 'projects')}
              style={{ 
                marginBottom: '20px', padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'projects' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px', border: '1px dashed #555',
                cursor: projects.length > 1 ? 'grab' : 'default',
                opacity: draggedItem.index === index && draggedItem.type === 'projects' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: projects.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                {projects.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Projects">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder</span>
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕ Remove
                </button>
              </div>

              <div style={gridStyle}>
                <div><label>Project Title</label><input type="text" value={proj.title} onChange={(e) => handleArrayChange(setProjects, projects, index, 'title', e.target.value)} style={inputStyle} /></div>
                <div><label>Technologies Used</label><input type="text" value={proj.technologiesUsed} onChange={(e) => handleArrayChange(setProjects, projects, index, 'technologiesUsed', e.target.value)} style={inputStyle} /></div>
                <div style={{ gridColumn: 'span 2' }}><label>Project Link (URL)</label><input type="text" value={proj.link} onChange={(e) => handleArrayChange(setProjects, projects, index, 'link', e.target.value)} style={inputStyle} /></div>
              </div>
              <label style={{ display: 'block', marginTop: '10px' }}>Description</label>
              <textarea value={proj.description} onChange={(e) => handleArrayChange(setProjects, projects, index, 'description', e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem(setProjects, projects, { title: '', description: '', technologiesUsed: '', link: '' })} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Project</button>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          style={{ 
            width: '100%', padding: '15px', 
            backgroundColor: isSaving ? '#6c757d' : '#28a745', 
            color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', 
            borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '10px' 
          }}
        >
          {isSaving ? '⏳ Saving...' : (id ? 'Update Existing Resume' : 'Save New Resume')}
        </button>
      </form>

      {/* --- Success Action Modal --- */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e1e2f', padding: '40px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '400px', border: '1px solid #333'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ color: 'white', marginTop: 0 }}>Successfully Saved!</h2>
            <p style={{ color: '#a0aec0', marginBottom: '30px' }}>
              Your resume data has been securely saved. What would you like to do next?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowCoverLetterModal(true);
                }}
                style={{ padding: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✍️ Draft AI Cover Letter
              </button>

              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowAtsModal(true);
                }}
                style={{ padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✨ Run Pro ATS Scan
              </button>

              <button 
                onClick={() => navigate(`/resume-viewer/${savedResumeId}`)}
                style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                👁️ View Rendered Resume
              </button>
              
              <button 
                onClick={() => setShowSuccessModal(false)}
                style={{ padding: '12px', backgroundColor: 'transparent', color: '#a0aec0', border: '1px solid #4a5568', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <AtsScannerModal 
        isOpen={showAtsModal} 
        onClose={() => setShowAtsModal(false)} 
        resumeData={{ title, personalInfo, skills, experience, education, projects }} 
      />

      <CoverLetterModal 
        isOpen={showCoverLetterModal} 
        onClose={() => setShowCoverLetterModal(false)} 
        resumeData={{ title, personalInfo, skills, experience, education, projects }} 
      />

    </div>
  );
}