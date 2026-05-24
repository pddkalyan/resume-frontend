import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import StatusPopup from './StatusPopup'; 

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  // --- Centalized API Configuration ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-qa-backend-service.onrender.com';
  
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [isFetching, setIsFetching] = useState(false); 

  // --- Expanded State matching the Backend Model ---
  const [title, setTitle] = useState('My Full Stack Resume');
  const [personalInfo, setPersonalInfo] = useState({ 
    fullName: '', email: '', phone: '', linkedInUrl: '', githubUrl: '' 
  });
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', description: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', graduationYear: '', gpa: '' }]);
  const [projects, setProjects] = useState([{ title: '', description: '', technologiesUsed: '', link: '' }]);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  // State to hold the temporary photo preview
  const [photoPreview, setPhotoPreview] = useState(null);

  // --- Drag and Drop State now stores BOTH index and list type ---
  const [draggedItem, setDraggedItem] = useState({ index: null, type: null });

  // --- Fetch existing resume data ---
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
          // --- UPDATED to use API_BASE_URL ---
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
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchExistingResume();
    }
  }, [id, API_BASE_URL]);

  // --- The Auto-Resizing Photo Handler ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaveStatus({ message: 'Optimizing and resizing photo...', type: 'info' });

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
        
        setSaveStatus({ message: 'Photo attached securely for this session!', type: 'success' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    sessionStorage.removeItem('resume_photo');
    setPhotoPreview(null);
  };

  // --- Dynamic Array Handlers ---
  const handleArrayChange = (setter, stateArray, index, field, value) => {
    const updatedArray = [...stateArray];
    updatedArray[index][field] = value;
    setter(updatedArray);
  };

  const handleAddArrayItem = (setter, stateArray, emptyItem) => {
    setter([...stateArray, emptyItem]);
  };

  // --- Smart Drag and Drop Reorder Function ---
  const handleDrop = (e, targetIndex, stateArray, setter, listType) => {
    e.preventDefault(); 
    
    // Safety check: Ensure we only drop if the list types match and we aren't dropping on the same index
    if (draggedItem.index === null || draggedItem.index === targetIndex || draggedItem.type !== listType) return;

    const newArray = [...stateArray];
    const draggedItemData = newArray.splice(draggedItem.index, 1)[0];
    newArray.splice(targetIndex, 0, draggedItemData);
    
    setter(newArray);
    setDraggedItem({ index: null, type: null }); // Reset state
  };

  const handleLogout = () => {
    sessionStorage.removeItem('resume_photo'); 
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  // --- The Save Function handles POST and PUT ---
  const handleSaveResume = async (e) => {
    e.preventDefault();
    setSaveStatus({ message: 'Saving securely to MongoDB...', type: 'info' });

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
        // --- UPDATED to use API_BASE_URL ---
        response = await axios.put(`${API_BASE_URL}/api/resumes/${id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        setSaveStatus({ message: `Success! Resume updated.`, type: 'success' });
      } else {
        // --- UPDATED to use API_BASE_URL ---
        response = await axios.post(`${API_BASE_URL}/api/resumes`, payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        setSaveStatus({ message: `Success! New resume saved.`, type: 'success' });
        
        setTimeout(() => navigate(`/resume-builder/${response.data.id}`, { replace: true }), 1500);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setSaveStatus({ message: 'Session expired. Please log in again.', type: 'error' });
        handleLogout();
      } else {
        setSaveStatus({ message: 'Failed to save resume. Is the backend running?', type: 'error' });
      }
    }
  };

  // --- UI Styling Constants ---
  const sectionStyle = { padding: '20px', backgroundColor: '#2a2a40', borderRadius: '8px', marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#1e1e2f', color: '#fff' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };

  if (isFetching) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading document data...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: '#1e1e2f', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
      
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
            onClick={() => {
              if (id) {
                navigate(`/resume-viewer/${id}`);
              } else {
                setSaveStatus({ message: 'Please save the resume first before viewing!', type: 'info' });
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
        
        {/* --- Document Info --- */}
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

        {/* --- Privacy First Photo Uploader --- */}
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

        {/* --- Personal Details --- */}
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

        {/* --- Skills --- */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Technical Skills</h3>
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
        </div>

        {/* --- Work Experience (Conditionally Draggable) --- */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Work Experience</h3>
          {experience.map((exp, index) => (
            <div 
              key={index} 
              draggable={experience.length > 1} // ONLY draggable if more than 1 item
              onDragStart={() => setDraggedItem({ index, type: 'experience' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, experience, setExperience, 'experience')}
              style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'experience' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px',
                border: '1px dashed #555',
                cursor: experience.length > 1 ? 'grab' : 'default', // Change cursor conditionally
                opacity: draggedItem.index === index && draggedItem.type === 'experience' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: experience.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                
                {/* Only render the Drag Handle if there is more than 1 item */}
                {experience.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Experiences">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder your Experiences</span>
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

        {/* --- Education (Conditionally Draggable) --- */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Education</h3>
          {education.map((edu, index) => (
            <div 
              key={index} 
              draggable={education.length > 1} // ONLY draggable if more than 1 item
              onDragStart={() => setDraggedItem({ index, type: 'education' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, education, setEducation, 'education')}
              style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'education' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px',
                border: '1px dashed #555',
                cursor: education.length > 1 ? 'grab' : 'default', // Change cursor conditionally
                opacity: draggedItem.index === index && draggedItem.type === 'education' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: education.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                
                {/* Only render the Drag Handle if there is more than 1 item */}
                {education.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Educations">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder your Educations</span>
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

        {/* --- Projects (Conditionally Draggable) --- */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Projects</h3>
          {projects.map((proj, index) => (
            <div 
              key={index} 
              draggable={projects.length > 1} // ONLY draggable if more than 1 item
              onDragStart={() => setDraggedItem({ index, type: 'projects' })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index, projects, setProjects, 'projects')}
              style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                backgroundColor: draggedItem.index === index && draggedItem.type === 'projects' ? '#1e1e2f' : '#33334d',
                borderRadius: '8px',
                border: '1px dashed #555',
                cursor: projects.length > 1 ? 'grab' : 'default', // Change cursor conditionally
                opacity: draggedItem.index === index && draggedItem.type === 'projects' ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: projects.length > 1 ? 'space-between' : 'flex-end', marginBottom: '15px' }}>
                
                {/* Only render the Drag Handle if there is more than 1 item */}
                {projects.length > 1 && (
                  <span style={{ fontSize: '20px', color: '#888', cursor: 'grab' }} title="Drag to reorder your Projects">
                    ☰ <span style={{ fontSize: '14px', marginLeft: '5px' }}>Drag to Reorder your Projects</span>
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

        <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
          {id ? 'Update Existing Resume' : 'Save New Resume'}
        </button>
      </form>
    </div>
  );
}