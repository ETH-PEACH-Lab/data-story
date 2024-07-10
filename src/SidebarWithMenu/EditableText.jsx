import React, { useState, useEffect, useRef } from 'react';
import './Story.css';

function EditableText({ textObj, onTextChange, index, onDelete, onMoveUp, onMoveDown }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        toggleRef.current && !toggleRef.current.contains(event.target)
      ) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="editable-text-container">
      <div className="edit-menu-toggle" ref={toggleRef}>
        <button onClick={() => setIsMenuVisible(!isMenuVisible)}>⋮</button>
      </div>
      {isMenuVisible && (
        <div className="edit-menu" ref={menuRef}>
          <button onClick={() => onMoveUp(index)}>↑</button>
          <button onClick={() => onMoveDown(index)}>↓</button>
          <button onClick={() => onDelete(index)}>✖</button>
        </div>
      )}
      <div onClick={handleTextClick} className="editable-text">
        {isEditing ? (
          <textarea
            value={textObj.text}
            onChange={(e) => {
              onTextChange(index, { ...textObj, text: e.target.value });
              autoResize(e.target);
            }}
            onInput={(e) => autoResize(e.target)}
            onBlur={handleBlur}
            autoFocus
            className="story-textarea"
            style={{ fontSize: textObj.fontSize }}
            ref={textareaRef}
          />
        ) : (
          <p className="story-text" style={{ fontSize: textObj.fontSize }}>{textObj.text}</p>
        )}
      </div>
    </div>
  );
}

export default EditableText;
