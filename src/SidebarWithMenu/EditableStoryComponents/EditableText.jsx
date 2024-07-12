import React, { useState, useEffect, useRef } from 'react';
import '../Story.css';
import EditMenu from './EditMenu';

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

  return (
    <div className="editable-text-container">
      <div className="edit-menu-toggle">
        <button onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}>⋮</button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
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
