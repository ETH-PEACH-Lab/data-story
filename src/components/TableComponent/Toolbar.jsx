import React, { useContext } from "react";
import { SharedContext } from "../../App";

function Toolbar({ rawValue }) {
  const {
    undoRedo,
    awareness,
    historyActions
  } = useContext(SharedContext);

  const {
    isUndoDisabled,
    isRedoDisabled,
    handleUndoAction,
    handleRedoAction
  } = undoRedo;

  const handleSaveCurrentVersion = historyActions.handleSaveCurrentVersion;

  return (
    <div className="toolbar-container">
      <div className="formula-bar">
        <span className="fx-label">fx</span>
        <input
          type="text"
          className="formula-input"
          readOnly
          value={rawValue || ""}
        />
      </div>

      <div className="format-buttons">
        <button><b>B</b></button>
        <button><i>I</i></button>
        <button>🖌️</button>
        <button>🎨</button>
      </div>

      <div className="action-buttons">
        <button
          className="btn reset"
          onClick={() => {
            if (window.confirm("Are you sure you want to reset everything? This cannot be undone.")) {
              historyActions.handleReset();
            }
          }}
        >
          🔁 Reset
        </button>

        <button
          className="btn undo"
          disabled={isUndoDisabled}
          onClick={handleUndoAction}
        >
          ↩️ Undo
        </button>

        <button
          className="btn redo"
          disabled={isRedoDisabled}
          onClick={handleRedoAction}
        >
          ↪️ Redo
        </button>

        <button
          className="btn save"
          onClick={() => handleSaveCurrentVersion("Save triggered")}
        >
          💾 Save
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
