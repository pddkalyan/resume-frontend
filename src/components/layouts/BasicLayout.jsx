import React from 'react';

export default function BasicLayout({ resumeData }) {
  if (!resumeData) return null;
  const { personalInfo, skills, experience, education, projects } = resumeData;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#000", padding: "40px", lineHeight: "1.5" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "15px", marginBottom: "20px" }}>
        <h1 style={{ margin: "0 0 5px 0", fontSize: "28px" }}>{personalInfo?.fullName || "Your Name"}</h1>
        <p style={{ margin: 0, fontSize: "14px" }}>
          {personalInfo?.email} | {personalInfo?.phone}
        </p>
      </div>

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid #ccc", marginBottom: "10px", textTransform: "uppercase" }}>Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>{exp.role}</span>
                <span>{exp.duration}</span>
              </div>
              <div style={{ fontStyle: "italic", marginBottom: "5px" }}>{exp.company}</div>
              <p style={{ margin: 0, fontSize: "14px" }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills (Comma separated list) */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid #ccc", marginBottom: "10px", textTransform: "uppercase" }}>Skills</h2>
          <p style={{ margin: 0, fontSize: "14px" }}>{skills.join(', ')}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid #ccc", marginBottom: "10px", textTransform: "uppercase" }}>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{edu.degree}</strong>
                <div>{edu.institution}</div>
              </div>
              <div>{edu.graduationYear}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}