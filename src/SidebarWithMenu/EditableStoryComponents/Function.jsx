import React from "react";
import "../Story.css";
import EditMenu from "./EditMenu";

const Function = ({
  column,
  func,
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdate,
  isMenuVisible,
  setVisibleMenuIndex,
  result,
}) => {
  return (
    <div className="function-container">
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onUpdate={onUpdate}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
      )}
      <div className="function">
        <strong>{func}</strong> of {column}:{" "}
        <span className="bold-underline">{result}</span>
      </div>
    </div>
  );
};

export default Function;
