import React from 'react';
import './TutorialMenu.css';

function TutorialMenu({ buttons, activeMenu, onMenuClick }) {
  return (
    <div className="vertical-menu">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => onMenuClick(button)}
          className={`vertical-button ${activeMenu === button ? 'active' : ''}`}
        >
          <span className="vertical-text">{button}</span>
        </button>
      ))}
    </div>
  );
}

export default TutorialMenu;
