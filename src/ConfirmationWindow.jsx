import React from "react";
import "./ConfirmationWindow.css";

const ConfirmationWindow = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="window-overlay">
      <div className="window-content">
        <p>{message}</p>
        <div className="window-buttons">
          <button className="button yes-button" onClick={onConfirm}>
            Yes
          </button>
          {onCancel && (
            <button className="button no-button" onClick={onCancel}>
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWindow;
