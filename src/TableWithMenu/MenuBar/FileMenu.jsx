import React, { useState, useRef } from "react";
import Papa from "papaparse";

const FileMenu = ({
  onSaveCurrent,
  onDataLoaded,
  toggleHistory,
  hotRef,
  showConfirmation,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  initialActionStack,
  setInitialActionStack,
  initialActionStackLength,
  setInitialActionStackLength,
  handleExport,
}) => {
  const fileInputRef = useRef(null);
  const [activeItem, setActiveItem] = useState("");

  const generateEmptyDataset = () => {
    const columns = Array.from({ length: 5 }, (_, i) => `Column ${i + 1}`);
    const emptyData = Array.from({ length: 5 }, () =>
      columns.reduce((acc, column) => ({ ...acc, [column]: null }), {})
    );
    return { data: emptyData };
  };

  const areActionStacksEqual = (stack1, stack2, length) => {
    if (stack1.length !== stack2.length) return false;
    for (let i = 0; i < Math.min(length, stack1.length); i++) {
      if (JSON.stringify(stack1[i]) !== JSON.stringify(stack2[i])) {
        return false;
      }
    }
    return true;
  };

  const handleMenuClick = (item) => {
    const undoRedo = hotRef.current.hotInstance.undoRedo;

    if (item === "History") {
      toggleHistory();
      return;
    }

    if (item === "Export") {
      setActiveItem(activeItem === "Export" ? "" : "Export");
      return;
    }

    if (!areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      setConfirmationMessage(
        "You have unsaved changes. Do you want to save them?"
      );
      setShowConfirmation(true);
      setOnConfirmAction(() => () => {
        onSaveCurrent();
        if (item === "New") {
          const { data } = generateEmptyDataset();
          onDataLoaded(data, `New Table ${Date.now()}`);
          resetFiltersAndSorting();
        } else if (item === "Open") {
          fileInputRef.current.click();
        }
      });
      setOnCancelAction(() => () => {
        if (item === "New") {
          const { data } = generateEmptyDataset();
          onDataLoaded(data, `New Table ${Date.now()}`);
          resetFiltersAndSorting();
        } else if (item === "Open") {
          fileInputRef.current.click();
        }
      });
    } else {
      if (item === "New") {
        const { data } = generateEmptyDataset();
        onDataLoaded(data, `New Table ${Date.now()}`);
        resetFiltersAndSorting();
      } else if (item === "Open") {
        fileInputRef.current.click();
        resetFiltersAndSorting();
      } else if (item === "Save") {
        onSaveCurrent();
      }
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;

        const data = Papa.parse(text, {
          header: true,
        }).data;

        onDataLoaded(data, file.name);
        resetFiltersAndSorting();
      };
      reader.readAsText(file);
    }
  };

  const resetFiltersAndSorting = () => {
    const hotInstance = hotRef.current.hotInstance;
    hotInstance.getPlugin("filters").clearConditions();
    hotInstance.getPlugin("filters").filter();
    hotInstance.getPlugin("columnSorting").clearSort();
    hotInstance.undoRedo.clear();
    setInitialActionStack([]);
    setInitialActionStackLength(0);
  };

  return (
    <>
      <div className="d-flex gap-2">
        {["New", "Open", "Save", "History", "Export"].map((item, index) => (
          <button
            key={index}
            className="btn btn-outline-secondary"
            onClick={() => handleMenuClick(item)}
          >
            {item === "New" && (
              <i
                className="bi bi-plus-circle"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {item === "Open" && (
              <i className="bi bi-upload" style={{ marginRight: "5px" }}></i>
            )}
            {item === "Save" && (
              <i className="bi bi-save" style={{ marginRight: "5px" }}></i>
            )}
            {item === "History" && (
              <i
                className="bi bi-clock-history"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {item === "Export" && (
              <i
                className="bi bi-file-earmark-arrow-down"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {item}
          </button>
        ))}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <div className={`collapse ${activeItem === "Export" ? "show" : ""}`}>
        <div
          className="card card-body"
          style={{ marginTop: "8px", width: "400px" }}
        >
          <div
            className="btn-group"
            role="group"
            style={{ width: "fit-content" }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleExport("table")}
            >
              <i className="bi bi-table" style={{ marginRight: "5px" }}></i>
              Table
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleExport("story")}
            >
              <i
                className="bi bi-journal-text"
                style={{ marginRight: "5px" }}
              ></i>
              Story
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileMenu;
