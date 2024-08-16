//Currently not used
import React, { useState } from "react";
import styles from "../MenuBar.module.css";
import { HeaderAction } from "../../../CustomUndoRedo";

const Headers = React.forwardRef(
  (
    {
      position,
      stopPropagation,
      selectedColumnIndex,
      selectedColumnName,
      setColumns,
      hotRef,
    },
    ref
  ) => {
    const [newColumnName, setNewColumnName] = useState("");

    const handleRenameColumn = () => {
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns];
        const oldHeader = newColumns[selectedColumnIndex].title;
        const newHeader = newColumnName;

        newColumns[selectedColumnIndex] = {
          ...newColumns[selectedColumnIndex],
          title: newColumnName,
        };

        const wrappedAction = () =>
          new HeaderAction(selectedColumnIndex, oldHeader, newHeader);
        hotRef.current.hotInstance.undoRedo.done(wrappedAction);

        return newColumns;
      });
      setNewColumnName("");
    };

    return (
      <div
        className="dropdown-menu show"
        style={{
          top: position.top - 68,
          left: position.left - 23,
          position: "absolute",
        }}
        onClick={stopPropagation}
        ref={ref}
      >
        <div className="dropdown-item">
          <div>
            {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
              "No column selected"}
          </div>
        </div>
        <div className="dropdown-item">
          <div>Current Name: {selectedColumnName}</div>
        </div>
        <div className="dropdown-item d-flex">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="New column name"
            className="form-control"
          />
          <button onClick={handleRenameColumn} className="btn btn-primary ms-2">
            Rename
          </button>
        </div>
      </div>
    );
  }
);

export default Headers;
