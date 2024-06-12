import React, { useState } from 'react';
import './History.css';
import treeify from 'object-treeify';

const HistorySidebar = ({ isHistoryVisible, uploadHistory, onHistoryItemClick, onHistoryItemDelete, toggleHistory }) => {
  return (
    <div className={`history-sidebar ${isHistoryVisible ? 'visible' : ''}`}>
      <button onClick={toggleHistory} className="collapsed-button">
        {isHistoryVisible ? 'Hide History' : 'Show History'}
      </button>
      {isHistoryVisible && ( // Only render the history content when sidebar is not collapsed
        <>
          <p>History</p>
          <ul>
            {uploadHistory.map((entry, index) => (
              <li key={index} className={`history-entry`} onClick={() => onHistoryItemClick(entry, index)}>
                <strong>{entry.fileName}</strong> - <em>{entry.timestamp}</em>
                <div>ID: {entry.id}, Derived from: {entry.parentId}</div>
                <button onClick={(event) => {
                  event.stopPropagation();
                  onHistoryItemDelete(index);
                }} className="button">Delete</button>
                {entry.actions && entry.actions.length > 0 && (
                  <ul>
                    {entry.actions.map((action, actionIndex) => (
                      <li key={actionIndex}>{action}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistorySidebar;
