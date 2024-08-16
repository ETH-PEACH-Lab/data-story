import React, { useState, useRef, useEffect } from "react";
import Text from "./FormatMenu/Text";
import Cell from "./FormatMenu/Cell";

const FormatMenu = ({
  onStyleChange,
  selectedColumnIndex,
  selectedColumnName,
  setColumns,
  columns,
  tableContainerRef,
  hotRef,
}) => {
  const [dropdownState, setDropdownState] = useState({
    activeItem: "",
    isColorDropdownVisible: false,
    colorContext: "",
  });

  const textButtonRef = useRef(null);
  const cellButtonRef = useRef(null);

  const menuItems = [
    "Text",
    "Cell",
    "Conditional Formatting",
    "Clear Formatting",
  ];

  const handleMenuClick = (item, buttonRef) => {
    const updateDropdownState = (updates) =>
      setDropdownState((prev) => ({ ...prev, ...updates }));

    if (item === "Color") {
      setDropdownState((prev) => ({
        ...prev,
        isColorDropdownVisible: !prev.isColorDropdownVisible,
        colorContext: "text", // Ensure colorContext is set to "text" when the Color button is clicked
      }));
    } else if (["Fill", "Border"].includes(item)) {
      // Handle Fill or Border separately to not close the "Cell" collapse
      setDropdownState((prev) => ({
        ...prev,
        isColorDropdownVisible: !prev.isColorDropdownVisible,
        colorContext: item.toLowerCase(),
      }));
    } else {
      setDropdownState((prev) => ({
        ...prev,
        activeItem: prev.activeItem === item ? "" : item,
        isColorDropdownVisible: false, // Close color picker when other items are clicked
        colorContext: "", // Reset colorContext when another item is clicked
      }));
    }

    if (
      ["Bold", "Italic", "Strike-through", "Clear Formatting"].includes(item)
    ) {
      onStyleChange(item.toLowerCase().replace("-", ""), null);
      setDropdownState({ activeItem: "", isColorDropdownVisible: false });
    }
  };

  const handleColorClick = (color) => {
    const { colorContext } = dropdownState;
    onStyleChange(
      colorContext === "text"
        ? "color"
        : colorContext === "fill"
        ? "backgroundColor"
        : "borderColor",
      color
    );
    setDropdownState({
      isColorDropdownVisible: false,
    });
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleClickOutside = (event) => {
    if (!dropdownState.activeItem && !dropdownState.isColorDropdownVisible)
      return;

    if (
      (textButtonRef.current && textButtonRef.current.contains(event.target)) ||
      (cellButtonRef.current && cellButtonRef.current.contains(event.target)) ||
      (tableContainerRef.current &&
        tableContainerRef.current.contains(event.target))
    )
      return;

    setDropdownState({ activeItem: "", isColorDropdownVisible: false });
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownState]);

  const activeButtonColor = {
    backgroundColor: "var(--secondary)",
    color: "white",
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex gap-2">
        {menuItems.map((item, index) => {
          const buttonRef =
            item === "Text"
              ? textButtonRef
              : item === "Cell"
              ? cellButtonRef
              : null;
          return (
            <button
              key={index}
              className="btn btn-outline-secondary"
              onClick={() => handleMenuClick(item, buttonRef)}
              ref={buttonRef}
              style={dropdownState.activeItem === item ? activeButtonColor : {}}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="w-100">
        <div
          className={`collapse ${
            dropdownState.activeItem === "Text" ? "show" : ""
          }`}
        >
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "8px" }}
          >
            <Text
              onStyleChange={onStyleChange}
              stopPropagation={stopPropagation}
              handleMenuClick={handleMenuClick}
              handleColorClick={handleColorClick}
              isColorDropdownVisible={dropdownState.isColorDropdownVisible}
            />
          </div>
        </div>

        <div
          className={`collapse ${
            dropdownState.activeItem === "Cell" ? "show" : ""
          }`}
        >
          <div className="card card-body" style={{ marginTop: "8px" }}>
            <Cell
              position={{}}
              stopPropagation={stopPropagation}
              handleMenuClick={handleMenuClick}
              handleColorClick={handleColorClick}
              isColorDropdownVisible={dropdownState.isColorDropdownVisible}
              colorContext={dropdownState.colorContext}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatMenu;
