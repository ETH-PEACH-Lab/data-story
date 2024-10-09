import React, { useEffect, useRef } from "react";
import "../Story.css";

const EditMenu = ({
  index,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,  
  setVisibleMenuIndex,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVisibleMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        <i class="bi bi-arrow-up"></i>
      </button>
      <button
        onClick={() => {
          onMoveDown(index);
          setVisibleMenuIndex(index + 1);
        }}
      >
        <i class="bi bi-arrow-down"></i>
      </button>
      <button onClick={() => onDelete(index)}>
        <i className="bi bi-trash3"></i>
      </button>
      <button onClick={() => onUpdate(index)}>
      <i class="bi bi-arrow-clockwise"></i>
      </button>
    </div>
  );
};

export default EditMenu;
