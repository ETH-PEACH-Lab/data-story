import React, { useState, useEffect } from 'react';
import './Story.css';

function EditableText({ text, onTextChange, index }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const autoResize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [isEditing]);

  const textareaRef = React.createRef();

  return (
    <div onClick={handleTextClick}>
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => {
            onTextChange(index, e.target.value);
            autoResize(e.target);
          }}
          onInput={(e) => autoResize(e.target)}
          onBlur={handleBlur}
          autoFocus
          className="story-textarea"
          ref={textareaRef}
        />
      ) : (
        <p className="story-text">{text}</p>
      )}
    </div>
  );
}

export default EditableText;