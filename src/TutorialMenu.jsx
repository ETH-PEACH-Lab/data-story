import React from 'react';
import './TutorialMenu.css';

function TutorialMenu({ buttons }) {
  return (
    <div className="vertical-menu">
      {buttons.map((button, index) => (
        <button key={index} className="vertical-button">
          <span className="vertical-text">{button.text}</span>
        </button>
      ))}
    </div>
  );
}

export default TutorialMenu;
