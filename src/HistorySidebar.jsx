import React, { useState, useEffect } from "react";
import "./History.css";

const HistorySidebar = ({
  isHistoryVisible,
  uploadHistory,
  onHistoryItemClick,
  onHistoryItemDelete,
  toggleHistory,
  currentDataId,
  idList,
  setIdList,
}) => {
  const [lastSelectedEntry, setLastSelectedEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    setLastSelectedEntry(currentDataId);
  }, [currentDataId]);

  const handleFilenameChange = (index) => {
    if (newFileName.trim() !== "") {
      const updatedHistory = [...uploadHistory];
      updatedHistory[index].fileName = newFileName;
      setEditingIndex(null);
      setNewFileName("");
      // Save updated history to local storage
      setUploadHistory(updatedHistory);
      setHistoryLocalStorage(updatedHistory);
    }
  };

  return (
    <div className={`history-sidebar ${isHistoryVisible ? "visible" : ""}`}>
      <button onClick={toggleHistory} className="collapsed-button">
        {isHistoryVisible ? "Hide History" : "Show History"}
      </button>
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
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={() => handleFilenameChange(index)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleFilenameChange(index);
                      }
                    }}
                  />
                ) : (
                  <strong
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingIndex(index);
                      setNewFileName(entry.fileName);
                    }}
                  >
                    {entry.fileName}
                  </strong>
                )}
                - <em>{entry.timestamp}</em>
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
