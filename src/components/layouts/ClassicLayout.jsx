import React from 'react';

export default function ClassicLayout({ resumeData }) {
  if (!resumeData) return null;
  const { personalInfo, skills, experience, education } = resumeData;

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', padding: '40px', color: 'black', backgroundColor: 'white', minHeight: '100%' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '38px', textTransform: 'uppercase' }}>
          {personalInfo?.fullName || 'Your Name'}
        </h1>
        <div style={{ marginTop: '8px', fontSize: '15px' }}>
          {personalInfo?.email} | {personalInfo?.phone} | {personalInfo?.linkedInUrl}
        </div>
      </div>

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', textTransform: 'uppercase', borderBottom: '1px solid black', paddingBottom: '3px', marginBottom: '15px' }}>Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span style={{ fontSize: '18px' }}>{exp.company}</span>
                <span>{exp.duration}</span>
              </div>
              <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>{exp.role}</div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', textTransform: 'uppercase', borderBottom: '1px solid black', paddingBottom: '3px', marginBottom: '15px' }}>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.institution}</span>
                <span>{edu.graduationYear}</span>
              </div>
              <div style={{ fontStyle: 'italic' }}>{edu.degree}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}