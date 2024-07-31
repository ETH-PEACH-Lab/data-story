import React from "react";
import "../Story.css";
import EditMenu from "./EditMenu";

const StoryChart = ({
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMenuVisible,
  setVisibleMenuIndex,
}) => {
  return (
    <div className="chart-container">
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          ⋮
        </button>
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
      <div className="chart">Placeholder</div>
    </div>
  );
};

export default StoryChart;
