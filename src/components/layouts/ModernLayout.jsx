import React from 'react';

export default function ModernLayout({ resumeData }) {
  if (!resumeData) return null;
  const { personalInfo, skills, experience, education, projects } = resumeData;

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', padding: '40px', color: '#333', backgroundColor: 'white', minHeight: '100%' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '3px solid #3b82f6', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '42px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {personalInfo?.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', gap: '20px', color: '#64748b', marginTop: '10px', fontSize: '14px', flexWrap: 'wrap' }}>
          {personalInfo?.email && <span>📧 {personalInfo.email}</span>}
          {personalInfo?.phone && <span>📱 {personalInfo.phone}</span>}
          {personalInfo?.linkedInUrl && <span>🔗 {personalInfo.linkedInUrl}</span>}
        </div>
      </div>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Technical Skills</h3>
          <p style={{ margin: 0, lineHeight: '1.6' }}>{Array.isArray(skills) ? skills.join(' • ') : skills}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '15px' }}>Professional Experience</h3>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{exp.role}</h4>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>{exp.duration}</span>
              </div>
              <div style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '5px' }}>{exp.company}</div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '15px' }}>Education</h3>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, color: '#0f172a' }}>{edu.degree}</h4>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{edu.graduationYear}</span>
              </div>
              <div style={{ fontSize: '14px' }}>{edu.institution} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}