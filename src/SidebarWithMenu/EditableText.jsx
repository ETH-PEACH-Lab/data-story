import React, { useState, useEffect, useRef } from 'react';
import './Story.css';

function EditableText({ textObj, onTextChange, index, onDelete, onMoveUp, onMoveDown, isMenuVisible, setVisibleMenuIndex }) {
  const [isEditing, setIsEditing] = useState(false);
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
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        setVisibleMenuIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setVisibleMenuIndex]);

  return (
    <div className="editable-text-container">
      <div className="edit-menu-toggle">
        <button onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}>⋮</button>
      </div>
      {isMenuVisible && (
        <div className="edit-menu">
          <button onClick={() => {
            onMoveUp(index);
            setVisibleMenuIndex(index - 1);
          }}>↑</button>
          <button onClick={() => {
            onMoveDown(index);
            setVisibleMenuIndex(index + 1);
          }}>↓</button>
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
