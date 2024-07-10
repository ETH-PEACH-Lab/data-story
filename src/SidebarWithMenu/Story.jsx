import React, { useEffect } from 'react';
import EditableText from './EditableText';
import './Story.css';

function Story({ texts, setTexts }) {
  const handleTextChange = (index, newTextObj) => {
    const newTexts = [...texts];
    newTexts[index] = newTextObj;
    setTexts(newTexts);
  };

  const handleAddTextBox = (type) => {
    const newText = {
      text: type === 'title' ? '--Title--' : type === 'subtitle' ? '--Subtitle--' : '--Text--',
      fontSize: type === 'title' ? '32px' : type === 'subtitle' ? '24px' : '16px',
    };
    setTexts([...texts, newText]);
  };

  useEffect(() => {
    const handleAddTextBoxEvent = (event) => {
      if (event.detail && event.detail.type) {
        const { type } = event.detail;
        handleAddTextBox(type);
      }
    };

    document.addEventListener('addTextBox', handleAddTextBoxEvent);
    return () => {
      document.removeEventListener('addTextBox', handleAddTextBoxEvent);
    };
  }, [texts]);

  const handleDelete = (index) => {
    const newTexts = texts.filter((_, i) => i !== index);
    setTexts(newTexts);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newTexts = [...texts];
      [newTexts[index - 1], newTexts[index]] = [newTexts[index], newTexts[index - 1]];
      setTexts(newTexts);
    }
  };

  const handleMoveDown = (index) => {
    if (index < texts.length - 1) {
      const newTexts = [...texts];
      [newTexts[index + 1], newTexts[index]] = [newTexts[index], newTexts[index + 1]];
      setTexts(newTexts);
    }
  };

  return (
    <div className="story-container">
      {texts.map((textObj, index) => (
        <EditableText
          key={index}
          index={index}
          textObj={textObj}
          onTextChange={handleTextChange}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ))}
    </div>
  );
}

export default Story;
