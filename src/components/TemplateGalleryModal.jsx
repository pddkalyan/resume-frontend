import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getLayoutComponent } from './layouts/LayoutRegistry'; // <-- NEW IMPORT

// THE FAKE DATA: Generic placeholders to show layout structure
const SAMPLE_RESUME_DATA = {
  personalInfo: {
    fullName: "Your Name Here",
    email: "professional.email@example.com",
    phone: "+1 (555) 123-4567",
    linkedInUrl: "linkedin.com/in/yourprofile",
    githubUrl: "github.com/yourusername"
  },
  skills: [
    "Java", "Spring Boot", "React.js", "Node.js", "PostgreSQL", "MongoDB", 
    "Docker", "Kubernetes", "AWS (EC2, S3, RDS)", "CI/CD Pipeline", 
    "Git", "RESTful APIs", "Microservices Architecture", "Agile/Scrum"
  ],
  experience: [
    {
      company: "Global Tech Solutions Inc.",
      role: "Senior Software Engineer",
      duration: "Jan 2021 - Present",
      description: "Architected and deployed scalable microservices using Spring Boot, improving overall system performance by 40%. Led a cross-functional team of 5 engineers to migrate legacy monolithic applications to AWS cloud infrastructure. Reduced deployment times by 60% through automated CI/CD pipelines using GitHub Actions and Docker."
    },
    {
      company: "Innovate Software LLC",
      role: "Full Stack Developer",
      duration: "Mar 2018 - Dec 2020",
      description: "Developed robust RESTful APIs for a high-traffic enterprise platform, successfully handling over 10,000 requests per minute. Integrated secure third-party payment gateways ensuring seamless financial transactions. Optimized complex database queries in PostgreSQL, reducing page load times by 25% across the main dashboard."
    },
    {
      company: "Creative Web Agency",
      role: "Junior Web Developer",
      duration: "Jun 2016 - Feb 2018",
      description: "Built responsive and highly interactive user interfaces using modern JavaScript frameworks. Collaborated closely with UX/UI designers to implement pixel-perfect frontend designs. Wrote comprehensive unit tests, increasing overall code coverage to 85%."
    }
  ],
  education: [
    {
      institution: "State University of Technology",
      degree: "Master of Science in Computer Science",
      graduationYear: "2016",
      gpa: "3.8/4.0"
    },
    {
      institution: "State University of Technology",
      degree: "Bachelor of Technology in Software Engineering",
      graduationYear: "2014",
      gpa: "3.9/4.0"
    }
  ],
  projects: [
    {
      title: "Enterprise E-Commerce Platform",
      technologiesUsed: "React, Spring Boot, MongoDB",
      link: "github.com/yourusername/ecommerce",
      description: "Developed a full-stack e-commerce solution serving 50k+ monthly active users. Implemented real-time inventory tracking, user authentication, and a dynamic recommendation engine based on user browsing history."
    },
    {
      title: "Automated Workflow Engine",
      technologiesUsed: "Java, ActiveMQ, PostgreSQL",
      link: "github.com/yourusername/workflow",
      description: "Designed a distributed message processing system capable of handling highly concurrent task queues, ensuring zero data loss during high-load traffic spikes."
    }
  ]
};

export default function TemplateGalleryModal({ isOpen, onClose, currentTemplateId, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDomain, setActiveDomain] = useState('All');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isOpen) return;

    const fetchTemplates = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      try {
        const response = await axios.get(`${API_BASE_URL}/api/templates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTemplates(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load template catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isOpen, API_BASE_URL]);

  if (!isOpen) return null;

  // Extract unique domains for the filter pills
  const allDomains = ['All', ...new Set(templates.flatMap(t => t.domains || []))];
  
  // Filter templates based on selected pill
  const displayedTemplates = activeDomain === 'All' 
    ? templates 
    : templates.filter(t => t.domains?.includes(activeDomain));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e2f', width: '95%', maxWidth: '1000px', height: '85vh',
        borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #333', backgroundColor: '#2a2a40' }}>
          <h2 style={{ margin: 0, color: '#3b82f6' }}>🎨 Template Gallery</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Filter Pills */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #333', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {allDomains.map(domain => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap',
                backgroundColor: activeDomain === domain ? '#3b82f6' : '#33334d',
                color: activeDomain === domain ? 'white' : '#a0aec0',
                transition: 'all 0.2s'
              }}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div style={{ padding: '30px', overflowY: 'auto', flexGrow: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: '50px' }}>Loading templates...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
              
              {displayedTemplates.map(template => {
                const isActive = currentTemplateId === template.templateId;
                const LayoutComponent = getLayoutComponent(template.baseComponent); // <-- GET COMPONENT
                
                return (
                  <div key={template.templateId} style={{
                    backgroundColor: '#2a2a40', borderRadius: '10px', overflow: 'hidden', 
                    border: isActive ? '2px solid #10b981' : '1px solid #444',
                    transition: 'transform 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* --- REPLACED STATIC THUMBNAIL WITH LIVE SCALED COMPONENT --- */}
                    <div style={{ height: '300px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                      <div style={{
                          width: '794px', height: '1123px', // A4 Paper size
                          transform: 'scale(0.32)', transformOrigin: 'top left', // Scale it down to fit the 300px div
                          position: 'absolute', top: 0, left: 0,
                          backgroundColor: 'white', pointerEvents: 'none'
                      }}>
                          <LayoutComponent 
                              resumeData={SAMPLE_RESUME_DATA} 
                              config={template.config} 
                          />
                      </div>
                      
                      {template.pro && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#f59e0b', color: 'black', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', zIndex: 10 }}>
                          PRO
                        </div>
                      )}
                    </div>
                    
                    {/* Details & Action */}
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{template.name}</h3>
                      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#a0aec0' }}>
                        {template.domains?.slice(0, 2).join(', ')}
                      </p>
                      
                      <button 
                        onClick={() => {
                           onSelectTemplate(template.templateId);
                           onClose();
                        }}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                          backgroundColor: isActive ? '#10b981' : '#3b82f6', color: 'white'
                        }}
                      >
                        {isActive ? '✓ Current Template' : 'Use This Template'}
                      </button>
                    </div>
                  </div>
                );
              })}
              
            </div>
          )}
        </div>

      </div>
    </div>
  );
}