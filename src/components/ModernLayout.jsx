import React from 'react';

export default function ModernLayout({ resumeData, config }) {
  // Safe fallbacks in case config is missing
  const primaryColor = config?.primaryColor || '#2563eb';
  const fontFamily = config?.fontFamily || 'sans-serif';

  return (
    <div style={{ fontFamily: fontFamily, color: '#333', display: 'flex', gap: '20px' }}>
      
      {/* LEFT COLUMN - Colored Sidebar */}
      <div style={{ width: '30%', backgroundColor: primaryColor, color: 'white', padding: '30px', borderRadius: '8px 0 0 8px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', lineHeight: '1.2' }}>{resumeData?.personalInfo?.fullName || 'Your Name'}</h1>
        
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>Contact</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>✉️ {resumeData?.personalInfo?.email}</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>📱 {resumeData?.personalInfo?.phone}</p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>Skills</h3>
          <p style={{ margin: '5px 0', fontSize: '14px', lineHeight: '1.6' }}>
            {resumeData?.skills ? resumeData.skills.join(', ') : 'Add your skills'}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN - Main Content */}
      <div style={{ width: '70%', padding: '30px', backgroundColor: '#fff', borderRadius: '0 8px 8px 0' }}>
        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, paddingBottom: '5px', marginTop: 0 }}>Experience</h2>
        {resumeData?.experience?.map((exp, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#111' }}>{exp.role}</h3>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>{exp.duration}</span>
            </div>
            <div style={{ fontSize: '15px', color: primaryColor, fontWeight: '500', marginBottom: '8px' }}>{exp.company}</div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: '#444' }}>{exp.description}</p>
          </div>
        ))}

        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, paddingBottom: '5px', marginTop: '30px' }}>Education</h2>
        {resumeData?.education?.map((edu, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#111' }}>{edu.degree}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
              <span>{edu.institution}</span>
              <span>{edu.graduationYear} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}