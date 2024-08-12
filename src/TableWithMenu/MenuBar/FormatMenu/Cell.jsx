import React, { useRef } from "react";
import styles from "../MenuBar.module.css";
import CustomColorPicker from "./CustomColorPicker";

const Cell = ({
  position,
  stopPropagation,
  handleMenuClick,
  handleColorClick,
  isColorDropdownVisible,
  colorDropdownPosition,
  colorContext,
}) => {
  const fillButtonRef = useRef(null);
  const borderButtonRef = useRef(null);

  const handleColorChange = (color) => {
    const appliedColor = color.hex === "#D3D3D3" ? "#FFFFFF" : color.hex;
    handleColorClick(appliedColor);
  };

  return (
    <div
      className="dropdown-menu show"
      style={{ top: position.top - 30, left: position.left }}
      onClick={stopPropagation}
    >
      {["Fill", "Border"].map((cellOption, idx) => {
        const ref = cellOption === "Fill" ? fillButtonRef : borderButtonRef;
        return (
          <div
            key={idx}
            className="dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(cellOption, ref);
            }}
          >
            <div ref={ref}>{cellOption}</div>
            {isColorDropdownVisible &&
              colorContext === cellOption.toLowerCase() && (
                <div
                  className="dropdown-menu show"
                  style={{
                    top: colorDropdownPosition.top - 196,
                    left: colorDropdownPosition.left - 55,
                  }}
                >
                  <CustomColorPicker
                    color={null}
                    onChangeComplete={handleColorChange}
                  />
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default Cell;
