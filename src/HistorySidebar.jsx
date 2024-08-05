import React, { useState, useEffect, useRef, useCallback } from "react";
import "./History.css";
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
      <div className="button-container">
        <button onClick={toggleHistory} className="toggle-button">
          {isHistoryVisible ? "Hide History" : "Show History"}
        </button>
        {isHistoryVisible && (
          <button onClick={handleDeleteAllHistory} className="delete-button">
            Delete All
          </button>
        )}
      </div>
      {isHistoryVisible && (
        <>
          <p>History</p>
          <ul>
            {uploadHistory.map((entry, index) => (
              <li
                key={index}
                className={`history-entry ${
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
                    <ul style={{ color: "gray" }}>
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
                  className="button"
                >
                  Delete
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
