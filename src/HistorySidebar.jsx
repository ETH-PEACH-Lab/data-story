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

  useEffect(() => {
    setLastSelectedEntry(currentDataId);
  }, [currentDataId]);

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
                <strong>{entry.fileName}</strong> - <em>{entry.timestamp}</em>
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
