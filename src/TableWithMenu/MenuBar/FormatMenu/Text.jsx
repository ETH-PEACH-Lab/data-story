import React, { useRef } from "react";
import styles from "../MenuBar.module.css";
import CustomColorPicker from "./CustomColorPicker";

const Text = ({
  position,
  onStyleChange,
  stopPropagation,
  handleMenuClick,
  handleColorClick,
  isColorDropdownVisible,
  colorDropdownPosition,
}) => {
  const colorButtonRef = useRef(null);

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
      {["Bold", "Italic", "Strike-through", "Color"].map((textOption, idx) => {
        const ref = textOption === "Color" ? colorButtonRef : null;
        return (
          <div
            key={idx}
            className="dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(textOption, ref);
            }}
          >
            <div ref={ref}>{textOption}</div>
            {textOption === "Color" && isColorDropdownVisible && (
              <div
                className="dropdown-menu show"
                style={{
                  top: colorDropdownPosition.top - 196,
                  left: colorDropdownPosition.left + 95,
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

export default Text;
