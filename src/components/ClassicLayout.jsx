import React from 'react';

export default function ClassicLayout({ resumeData, config }) {
  const primaryColor = config?.primaryColor || '#000000';
  const fontFamily = config?.fontFamily || 'serif';

  return (
    <div style={{ fontFamily: fontFamily, color: '#000', padding: '40px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
      
      {/* HEADER - Centered */}
      <div style={{ textAlign: 'center', borderBottom: `3px solid ${primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', textTransform: 'uppercase', letterSpacing: '2px', color: primaryColor }}>
          {resumeData?.personalInfo?.fullName || 'Your Name'}
        </h1>
        <div style={{ fontSize: '14px', color: '#333' }}>
          {resumeData?.personalInfo?.email} | {resumeData?.personalInfo?.phone} | {resumeData?.personalInfo?.linkedInUrl}
        </div>
      </div>

      {/* EXPERIENCE */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px', color: primaryColor }}>
          Professional Experience
        </h2>
        {resumeData?.experience?.map((exp, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{exp.company}</h3>
              <span style={{ fontSize: '14px', fontStyle: 'italic' }}>{exp.duration}</span>
            </div>
            <div style={{ fontSize: '15px', fontStyle: 'italic', marginBottom: '5px', color: '#555' }}>{exp.role}</div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{exp.description}</p>
          </div>
        ))}
      </div>

      {/* EDUCATION */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px', color: primaryColor }}>
          Education
        </h2>
        {resumeData?.education?.map((edu, index) => (
          <div key={index} style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{edu.institution}</div>
              <div style={{ fontSize: '14px', fontStyle: 'italic' }}>{edu.degree}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px' }}>{edu.graduationYear}</div>
              {edu.gpa && <div style={{ fontSize: '14px', color: '#555' }}>GPA: {edu.gpa}</div>}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}