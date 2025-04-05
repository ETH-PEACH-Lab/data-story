import React, { useState, useContext, useRef, useEffect } from "react";
import { HeaderAction } from "../../CustomUndoRedo";
import { SharedContext } from "../../App";

const EditMenu = ({
  countAndRemoveDuplicates,
  tableContainerRef,
  selectedColumnIndex,
  selectedColumnName,
  handleFindReplace,
  setColumns,
  hotRef,
  handleSaveCurrentVersion,
}) => {
  const [newColumnName, setNewColumnName] = useState("");

	const { updateCols, activeItem, setActiveItem, setActiveMenu, activeMenu } = useContext(SharedContext)

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [activeItem, activeMenu])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleRenameColumn()
  };
  
  const handleRenameColumn = () => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const oldHeader = newColumns[selectedColumnIndex].title;
      const newHeader = newColumnName;

      newColumns[selectedColumnIndex] = {
        ...newColumns[selectedColumnIndex],
        title: newHeader,
      };

      hotRef.current.hotInstance.updateSettings({
        colHeaders: newColumns.map((col) => col.title),
      });

      const headerAction = new HeaderAction(
        selectedColumnIndex,
        oldHeader,
        newHeader
      );
      hotRef.current.hotInstance.undoRedo.done(() => headerAction);

      updateCols(newColumns)
      handleSaveCurrentVersion("Column " + (selectedColumnIndex + 1) + " header is changed to " + newHeader);
      //*#*//

      return newColumns;
    });

    setNewColumnName("");
    setActiveItem("");
    setActiveMenu("");
    console.log("New column name and active item reset");
  };

  return (
    <div>
      <div>
        <div className={`collapse ${activeItem === "Headers" ? "show" : ""}`}>
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "8px" }}
          >
            <div style={{ color: "black" }}>
              <span style={{ fontWeight: "bold" }}>Selected column:</span>{" "}
              {selectedColumnName ? (
                selectedColumnName
              ) : (
                <span style={{ color: "#a53939", fontWeight: "bold" }}>
                  No column selected
                </span>
              )}
            </div>
            <div className="d-flex">
              <input
                type="text"
                ref={inputRef}
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New column name"
                className="form-control"
              />
              <button
                onClick={handleRenameColumn}
                className="btn btn-secondary ms-2"
                disabled={!selectedColumnName} // Disable if no column is selected
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenu;
