import React, { useRef } from "react";
import CustomColorPicker from "./CustomColorPicker";

const Cell = ({
  stopPropagation,
  handleMenuClick,
  handleColorClick,
  isColorDropdownVisible,
  colorContext,
}) => {
  const fillButtonRef = useRef(null);
  const borderButtonRef = useRef(null);

  const handleColorChange = (color) => {
    const appliedColor = color.hex === "#D3D3D3" ? "#FFFFFF" : color.hex;
    handleColorClick(appliedColor);
  };

  // Define the active button color style for Fill and Border
  const getActiveButtonStyle = (option) =>
    isColorDropdownVisible && colorContext === option.toLowerCase()
      ? { backgroundColor: "var(--secondary)", color: "white" }
      : {};

  return (
    <div onClick={stopPropagation}>
      <div
        className="btn-group"
        role="group"
        aria-label="Cell formatting options"
      >
        {["Fill", "Border"].map((cellOption, idx) => {
          const ref = cellOption === "Fill" ? fillButtonRef : borderButtonRef;
          return (
            <button
              key={idx}
              ref={ref}
              className="btn btn-outline-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(cellOption, ref);
              }}
              style={getActiveButtonStyle(cellOption)}
            >
              {cellOption === "Fill" && (
                <i
                  className="bi bi-paint-bucket"
                  style={{ marginRight: "5px" }}
                ></i>
              )}
              {cellOption === "Border" && (
                <i
                  className="bi bi-border-outer"
                  style={{ marginRight: "5px" }}
                ></i>
              )}
              {cellOption}
            </button>
          );
        })}
      </div>

      {["Fill", "Border"].map((cellOption, idx) => {
        return (
          isColorDropdownVisible &&
          colorContext === cellOption.toLowerCase() && (
            <div
              key={idx}
              className="collapse show"
              style={{ marginTop: "8px" }}
            >
              <div
                className="card card-body"
                style={{
                  backgroundColor: "white",
                  padding: "10px",
                  width: "262px",
                }}
              >
                <CustomColorPicker
                  color={null}
                  onChangeComplete={handleColorChange}
                />
              </div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default Cell;
