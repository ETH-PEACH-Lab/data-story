import React, { useEffect, useRef } from 'react';
import '../Story.css';

const EditMenu = ({ index, onMoveUp, onMoveDown, onDelete, setVisibleMenuIndex }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVisibleMenuIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setVisibleMenuIndex]);

  return (
    <div className="edit-menu" ref={menuRef}>
      <button
        onClick={() => {
          onMoveUp(index);
          setVisibleMenuIndex(index - 1);
        }}
      >
        ↑
      </button>
      <button
        onClick={() => {
          onMoveDown(index);
          setVisibleMenuIndex(index + 1);
        }}
      >
        ↓
      </button>
      <button onClick={() => onDelete(index)}>✖</button>
    </div>
  );
};

export default EditMenu;
