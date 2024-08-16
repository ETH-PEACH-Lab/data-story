import React, { useState } from "react";

const EditMenu = ({
  countAndRemoveDuplicates,
  tableContainerRef,
  selectedColumnIndex,
  selectedColumnName,
  handleFindReplace,
  setColumns,
  hotRef,
}) => {
  const [activeItem, setActiveItem] = useState("");
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [newColumnName, setNewColumnName] = useState("");

  const handleMenuClick = (item) => {
    setActiveItem(activeItem === item ? "" : item);
    if (item === "Remove Duplicates") {
      const duplicates = countAndRemoveDuplicates(false); // Assuming this function returns the count of duplicates without removing them
      setDuplicateCount(duplicates);
    }
  };

  const handleFindReplaceClick = () => {
    handleFindReplace(findText, replaceText);
    setActiveItem("");
  };

  const handleRemoveDuplicates = () => {
    countAndRemoveDuplicates(true);
    setActiveItem("");
  };

  const handleRenameColumn = () => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const oldHeader = newColumns[selectedColumnIndex].title;
      const newHeader = newColumnName;

      newColumns[selectedColumnIndex] = {
        ...newColumns[selectedColumnIndex],
        title: newColumnName,
      };

      const wrappedAction = new HeaderAction(
        selectedColumnIndex,
        oldHeader,
        newHeader
      );
      hotRef.current.hotInstance.undoRedo.done(wrappedAction);

      return newColumns;
    });
    setNewColumnName("");
    setActiveItem("");
  };

  // Define your active button color
  const activeButtonColor = {
    backgroundColor: "var(--secondary)", // Define your active color here
    color: "white",
  };

  return (
    <div>
      <div className="d-flex gap-2">
        {["Find and Replace", "Remove Duplicates", "Headers"].map(
          (item, index) => (
            <button
              key={index}
              className="btn btn-outline-secondary"
              onClick={() => handleMenuClick(item)}
              style={activeItem === item ? activeButtonColor : {}}
            >
              {item}
            </button>
          )
        )}
      </div>

      <div>
        <div
          className={`collapse ${
            activeItem === "Find and Replace" ? "show" : ""
          }`}
        >
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "8px" }}
          >
            <div>
              {`Selected column: ${selectedColumnName}` || "No column selected"}
            </div>
            <div>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find"
                className="form-control"
              />
            </div>
            <div>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with"
                className="form-control"
              />
            </div>
            <div>
              <button
                onClick={handleFindReplaceClick}
                className="btn btn-secondary mt-2"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div
          className={`collapse ${
            activeItem === "Remove Duplicates" ? "show" : ""
          }`}
        >
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "8px" }}
          >
            <div>Number of duplicate rows: {duplicateCount}</div>
            <button
              onClick={handleRemoveDuplicates}
              className="btn btn-secondary mt-2"
              style={{ width: "86px" }}
            >
              Remove
            </button>
          </div>
        </div>

        <div className={`collapse ${activeItem === "Headers" ? "show" : ""}`}>
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "8px" }}
          >
            <div>
              {`Selected column: ${selectedColumnName}` || "No column selected"}
            </div>
            <div className="d-flex">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="New column name"
                className="form-control"
              />
              <button
                onClick={handleRenameColumn}
                className="btn btn-secondary ms-2"
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
