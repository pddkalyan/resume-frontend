import React from 'react';

export default function SecureDocumentViewer({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      
      <style>
        {`
          @media print {
            .ai-resistant-watermark {
              display: none !important;
            }
          }
        `}
      </style>

      {/* The Document Container - DEADLOCK REMOVED */}
      <div style={{ position: 'relative', userSelect: 'none' }}>
        
        {/* --- THE X-HATCH AI-RESISTANT WATERMARK SYSTEM --- */}
        <div className="no-print ai-resistant-watermark" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 50, overflow: 'hidden'
        }}>
            
          {/* Layer 1: Micro-Pattern Noise (Difference Mode) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '200%', height: '200%',
            opacity: 0.03, transform: 'rotate(-15deg) translate(-20%, -20%)',
            display: 'flex', flexWrap: 'wrap', gap: '10px',
            mixBlendMode: 'difference' 
          }}>
            {Array.from({ length: 400 }).map((_, i) => (
              <span key={`micro-${i}`} style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>
                INDIAN
              </span>
            ))}
          </div>

          {/* Layer 2: Macro-Pattern (Top-Left to Bottom-Right) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '200%', height: '200%',
            opacity: 0.08, transform: 'translate(-25%, -25%)', display: 'flex', flexWrap: 'wrap', gap: '50px', 
            justifyContent: 'center', alignItems: 'center',
            mixBlendMode: 'multiply' 
          }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={`macro1-${i}`} style={{ 
                transform: `rotate(-35deg)`, 
                fontSize: '28px', 
                color: '#000', 
                fontWeight: 900,
                whiteSpace: 'nowrap'
              }}>
                Resume-Builder Made by INDIAN
              </span>
            ))}
          </div>

          {/* Layer 3: Macro-Pattern (Bottom-Left to Top-Right) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '200%', height: '200%',
            opacity: 0.08, transform: 'translate(-25%, -25%)', display: 'flex', flexWrap: 'wrap', gap: '50px', 
            justifyContent: 'center', alignItems: 'center',
            mixBlendMode: 'multiply' 
          }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={`macro2-${i}`} style={{ 
                transform: `rotate(35deg)`, 
                fontSize: '28px', 
                color: '#000', 
                fontWeight: 900,
                whiteSpace: 'nowrap'
              }}>
                Resume-Builder Made by INDIAN
              </span>
            ))}
          </div>

        </div>

        {/* The Actual Resume Component */}
        {children}

      </div>
    </div>
  );
}