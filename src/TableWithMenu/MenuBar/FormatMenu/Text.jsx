import React, { useRef } from "react";
import CustomColorPicker from "./CustomColorPicker";

const Text = ({
  onStyleChange,
  stopPropagation,
  handleMenuClick,
  handleColorClick,
  isColorDropdownVisible,
}) => {
  const colorButtonRef = useRef(null);

  const handleColorChange = (color) => {
    const appliedColor = color.hex === "#D3D3D3" ? "#FFFFFF" : color.hex;
    handleColorClick(appliedColor);
  };

  const handleColorButtonClick = (e) => {
    e.stopPropagation();
    handleMenuClick("Color", colorButtonRef);
  };

  const activeButtonStyle = isColorDropdownVisible
    ? { backgroundColor: "var(--secondary)", color: "white" }
    : {};

  return (
    <div onClick={stopPropagation}>
      <div
        className="btn-group"
        role="group"
        aria-label="Text formatting options"
      >
        {["Bold", "Italic", "Strike-through"].map((textOption, idx) => (
          <button
            key={idx}
            className="btn btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(textOption, null);
            }}
          >
            {textOption === "Bold" && (
              <i className="bi bi-type-bold" style={{ marginRight: "5px" }}></i>
            )}
            {textOption === "Italic" && (
              <i
                className="bi bi-type-italic"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {textOption === "Strike-through" && (
              <i
                className="bi bi-type-strikethrough"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {textOption}
          </button>
        ))}

        <button
          ref={colorButtonRef}
          className="btn btn-outline-secondary"
          onClick={handleColorButtonClick}
          style={activeButtonStyle} // Apply the active style if color picker is visible
        >
          <i className="bi bi-palette" style={{ marginRight: "5px" }}></i>
          Color
        </button>
      </div>

      <div
        className={`collapse ${isColorDropdownVisible ? "show" : ""}`}
        style={{ marginTop: "8px" }}
      >
        <div
          className="card card-body"
          style={{ backgroundColor: "white", padding: "10px", width: "262px" }}
        >
          <CustomColorPicker
            color={null}
            onChangeComplete={handleColorChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Text;
