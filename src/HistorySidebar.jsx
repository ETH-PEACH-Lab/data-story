import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles/History.css";
import {
  setHistoryLocalStorage,
  clearAllLocalStorage,
} from "./utils/storageHandlers";

const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

const HistorySidebar = ({
  isHistoryVisible,
  uploadHistory,
  setUploadHistory,
  onHistoryItemClick,
  onHistoryItemDelete,
  toggleHistory,
  currentDataId,
  idList,
  setIdList,
  handleDeleteAllHistory,
}) => {
  const [lastSelectedEntry, setLastSelectedEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setLastSelectedEntry(currentDataId);
  }, [currentDataId]);

  const saveFileName = useCallback(
    (index) => {
      const trimmedFileName = newFileName.trim();
      if (
        trimmedFileName !== "" &&
        trimmedFileName !== uploadHistory[index].fileName
      ) {
        const updatedHistory = [...uploadHistory];
        updatedHistory[index].fileName = trimmedFileName;
        setUploadHistory(updatedHistory);
        setHistoryLocalStorage(updatedHistory);
      }
      setEditingIndex(null);
      setNewFileName("");
    },
    [newFileName, uploadHistory, setUploadHistory]
  );

  useOutsideClick(inputRef, () => {
    if (editingIndex !== null) {
      saveFileName(editingIndex);
    }
  });

  const startEditing = (index, fileName) => {
    setEditingIndex(index);
    setNewFileName(fileName);
  };

  return (
    <div className={`history-sidebar ${isHistoryVisible ? "visible" : ""}`}>
      <div className="button-container d-flex justify-content-between align-items-center p-2">
        <button
          onClick={toggleHistory}
          className={`btn btn-light ${
            isHistoryVisible ? "history-visible" : "history-collapsed"
          }`}
        >
          {isHistoryVisible ? "Hide History" : "Show History"}
        </button>
        {isHistoryVisible && (
          <button onClick={handleDeleteAllHistory} className="btn btn-danger">
            <i className="bi bi-trash3"></i> Delete All
          </button>
        )}
      </div>
      {isHistoryVisible && (
        <>
          <ul className="list-group w-100">
            {uploadHistory.map((entry, index) => (
              <li
                key={index}
                className={`history-entry list-group-item ${
                  entry.id === lastSelectedEntry ? "active" : ""
                }`}
                onClick={() => {
                  onHistoryItemClick(entry, index);
                  setLastSelectedEntry(entry.id);
                }}
              >
                {editingIndex === index ? (
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={() => {
                      saveFileName(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveFileName(index);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <strong
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(index, entry.fileName);
                    }}
                  >
                    {entry.fileName}
                  </strong>
                )}
                {" - "} <em>{entry.timestamp}</em>
                <div>
                  ID: {entry.id}, Derived from: {entry.parentId}
                </div>
                {entry.actions && entry.actions.length > 0 && (
                  <details>
                    <summary>Actions since last save</summary>
                    <ul className="list-unstyled text-muted">
                      {entry.actions.map((action, actionIndex) => (
                        <li key={actionIndex}>
                          <details>
                            <summary>{action.actionType}</summary>
                            <pre>{JSON.stringify(action, null, 2)}</pre>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onHistoryItemDelete(index);
                  }}
                  className="btn btn-danger mt-2"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistorySidebar;
