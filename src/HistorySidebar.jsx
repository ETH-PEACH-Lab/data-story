import React from 'react';
import './History.css';
import treeify from 'object-treeify';

const HistorySidebar = ({ isHistoryVisible, uploadHistory, activeIndex, onHistoryItemClick, toggleHistory }) => {
  return (
    <div className={`history-sidebar ${isHistoryVisible ? 'visible' : ''}`}>
      <button onClick={toggleHistory}>Hide History</button>
      <p>History</p>
      <ul>
        {uploadHistory.map((entry, index) => (
          <li key={index} className={`history-entry ${index === activeIndex ? 'active' : ''}`} onClick={() => onHistoryItemClick(entry, index)}>
          <strong>{entry.fileName}</strong> - <em>{entry.timestamp}</em>
          <div>ID: {entry.id}, Derived from: {entry.parentId}</div>
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
    </div>
  );
};

export default HistorySidebar;
