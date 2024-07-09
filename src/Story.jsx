import React, { useState } from 'react';
import './Story.css';

function Story() {
  const [texts, setTexts] = useState([
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  ]);
  const [isEditing, setIsEditing] = useState(null);

  const handleTextClick = (index) => {
    setIsEditing(index);
  };

  const handleTextChange = (index, newText) => {
    const newTexts = [...texts];
    newTexts[index] = newText;
    setTexts(newTexts);
  };

  const handleBlur = () => {
    setIsEditing(null);
  };

  const addTextBox = () => {
    setTexts([...texts, '']); // Add a new empty text box
  };

  return (
    <div className="story-container">
      {texts.map((text, index) => (
        <div key={index} onClick={() => handleTextClick(index)}>
          {isEditing === index ? (
            <textarea
              value={text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              onBlur={handleBlur}
              autoFocus
              className="story-textarea"
            />
          ) : (
            <p className="story-text">{text}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Story;
