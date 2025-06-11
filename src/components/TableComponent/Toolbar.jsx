import React, { useContext } from "react";
import { SharedContext } from "../../App";
import { toggleCellFormat } from "../../utils/formatHandlers";
import { Select, MenuItem } from "@mui/material";

function Toolbar({ rawValue }) {
  const {
    undoRedo,
    awareness,
    historyActions,
    setCellFormat,
    selectedCellsRef,
  } = useContext(SharedContext);

  const {
    isUndoDisabled,
    isRedoDisabled,
    handleUndoAction,
    handleRedoAction
  } = undoRedo;

  const handleSaveCurrentVersion = historyActions.handleSaveCurrentVersion;

  const handleclick = (attr, val) => toggleCellFormat(setCellFormat, selectedCellsRef, attr, val)

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
        <button onClick={() => handleclick("bold")}><b>B</b></button>
        <button onClick={() => handleclick("italic")}><i>I</i></button>
        <button>🖌️</button>
        <button>
          <Select
            displayEmpty
            IconComponent={() => null}
            style={{ width: "32px", height: "32px", display: "flex", justifyContent: "center" }}
            renderValue={() => "🎨"}
          >
            <MenuItem value="bg-light" onClick={() => handleclick("bg", "bg-light")}>
              <span className="bg-light color-circle" />
            </MenuItem>
            <MenuItem value="bg-info" onClick={() => handleclick("bg", "bg-info")}>
              <span className="bg-info color-circle" />
            </MenuItem>
            <MenuItem value="bg-success" onClick={() => handleclick("bg", "bg-success")}>
              <span className="bg-success color-circle" />
            </MenuItem>
            <MenuItem value="bg-warning" onClick={() => handleclick("bg", "bg-warning")}>
              <span className="bg-warning color-circle" />
            </MenuItem>
          </Select></button>
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
