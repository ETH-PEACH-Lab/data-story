import React, { useContext } from "react";
import { SharedContext } from "../../App"; // Update this path if needed
import { UserCircles } from "./UserCircles"; // Ensure this import is correct
import "./TopBanner.css";

function TopBanner() {
  const {
    undoRedo,
    awareness,
    idList,
    setIdList,
    handleSaveCurrentVersion,
    historyActions
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
          className="btn btn-warning"
          onClick={() => {
            if (window.confirm("Are you sure you want to reset everything? This cannot be undone.")) {
              historyActions.handleReset();
            }
          }}
        >
          <i className="bi bi-arrow-repeat"></i> Reset
        </button>

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
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (idList.length === 0) {
              setIdList([1]);
            }
            handleSaveCurrentVersion("History update button is triggered");
          }}
        >
          <i className="bi bi-save"></i> Save
        </button>
      </div>
      <UserCircles awareness={awareness} />
    </div>
  );
}

export default TopBanner;
