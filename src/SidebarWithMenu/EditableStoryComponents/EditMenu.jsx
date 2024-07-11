import React from 'react';

const EditMenu = ({ index, onMoveUp, onMoveDown, onDelete, setVisibleMenuIndex }) => {
  return (
    <div className="edit-menu">
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
