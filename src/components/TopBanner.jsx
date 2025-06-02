import React, { useContext } from "react";
import { SharedContext } from "../App"; // Update this path if needed
import { UserCircles } from "./UserCircles"; // Ensure this import is correct

function TopBanner() {
  const {
    undoRedo,
    awareness,
    idList,
    setIdList,
    handleSaveCurrentVersion,
  } = useContext(SharedContext);

  const {
    isUndoDisabled,
    isRedoDisabled,
    handleUndoAction,
    handleRedoAction,
  } = undoRedo;

  return (
    <div className="top-banner">
      <h1>Data-Story</h1>
      <div className="undo-redo-container">
        <button
          className={`btn btn-primary ${isUndoDisabled ? "disabled" : ""}`}
          onClick={handleUndoAction}
          disabled={isUndoDisabled}
        >
          <i className="bi bi-arrow-counterclockwise"></i> Undo
        </button>
        <button
          className={`btn btn-primary ${isRedoDisabled ? "disabled" : ""}`}
          onClick={handleRedoAction}
          disabled={isRedoDisabled}
        >
          <i className="bi bi-arrow-clockwise"></i> Redo
        </button>
      </div>
      <UserCircles awareness={awareness} />
      <div className="save-button-container">
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (idList.length === 0) {
              setIdList([1]);
            }
            handleSaveCurrentVersion("History update button is triggered");
          }}
        >
          <i className="bi bi-save"></i> Save Current Version
        </button>
      </div>
    </div>
  );
}

export default TopBanner;
