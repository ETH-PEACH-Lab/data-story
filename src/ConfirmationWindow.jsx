import React from "react";
import { Button } from "react-bootstrap";
import "./ConfirmationWindow.css";
import "./styles/App.css";

const ConfirmationWindow = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="window-overlay">
      <div className="window-content">
        <p>{message}</p>
        <div className="window-buttons">
          <Button
            variant="success"
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
          >
            {onCancel ? "Yes" : "Ok"}
          </Button>
          {onCancel && (
            <Button variant="danger" onClick={onCancel}>
              No
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationWindow;
