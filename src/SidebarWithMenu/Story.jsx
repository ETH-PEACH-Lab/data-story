import React from 'react';
import EditableText from './EditableText';
import './Story.css';

function Story({ texts, setTexts }) {
  const handleTextChange = (index, newText) => {
    const newTexts = [...texts];
    newTexts[index] = newText;
    setTexts(newTexts);
  };

  return (
    <div className="story-container">
      {texts.map((text, index) => (
        <EditableText
          key={index}
          index={index}
          text={text}
          onTextChange={handleTextChange}
        />
      ))}
    </div>
  );
}

export default Story;
