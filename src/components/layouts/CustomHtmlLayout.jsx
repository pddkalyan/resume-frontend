import React from 'react';
import DOMPurify from 'dompurify';

export default function CustomHtmlLayout({ resumeData, config }) {
  // 1. Get the raw HTML from the database config
  let rawHtml = config?.html || "<div><h3>Template loading error...</h3></div>";

  // 2. Safe mapping function: Replace handlebars with actual React state data
  const injectData = (htmlString, data) => {
    let injected = htmlString;
    
    // Personal Info
    injected = injected.replace(/{{fullName}}/g, data?.personalInfo?.fullName || 'Your Name');
    injected = injected.replace(/{{email}}/g, data?.personalInfo?.email || 'email@example.com');
    injected = injected.replace(/{{phone}}/g, data?.personalInfo?.phone || '+1 234 567 890');
    injected = injected.replace(/{{linkedInUrl}}/g, data?.personalInfo?.linkedInUrl || 'linkedin.com/in/username');
    injected = injected.replace(/{{githubUrl}}/g, data?.personalInfo?.githubUrl || 'github.com/username');
    injected = injected.replace(/{{skills}}/g, data?.skills?.join(', ') || 'Your Skills');

    // Note: For a production app, you would write a regex loop here to dynamically 
    // generate HTML block iterations for the Experience and Education arrays. 
    // For this prototype, we are just mapping the top-level personal data.

    return injected;
  };

  const processedHtml = injectData(rawHtml, resumeData);

  // 3. THE SHIELD: Sanitize the final string before React renders it
  const safeHtml = DOMPurify.sanitize(processedHtml);

  return (
    <div 
        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
        dangerouslySetInnerHTML={{ __html: safeHtml }} 
    />
  );
}