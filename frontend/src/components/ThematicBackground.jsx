import React from 'react';
import './ThematicBackground.css';
import govtBg from '../assets/govt_portal_bg.png';

const ThematicBackground = ({ children, opacity = 0.35, animate = true, mode = "light" }) => {
  return (
    <div className={`thematic-root ${mode}`}>
      <div className={`thematic-bg-container ${mode}`}>
        <img 
          src={govtBg} 
          alt="Indian Heritage Background" 
          className={`thematic-main-bg ${animate ? 'animate' : ''}`} 
          style={{ opacity: opacity }}
        />
        <div className={`thematic-bg-overlay ${mode}`} />
      </div>
      <div className="thematic-content">
        {children}
      </div>
    </div>
  );
};

export default ThematicBackground;
