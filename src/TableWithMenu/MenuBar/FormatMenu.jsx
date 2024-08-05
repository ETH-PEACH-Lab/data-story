import React, { useState, useRef, useEffect } from "react";
import styles from "./MenuBar.module.css";
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
    isTextDropdownVisible: false,
    isCellDropdownVisible: false,
    isColorDropdownVisible: false,
    dropdownPosition: { top: 0, left: 0 },
    colorDropdownPosition: { top: 0, left: 0 },
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

    if (buttonRef && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      };

      switch (item) {
        case "Text":
          updateDropdownState({
            isTextDropdownVisible: !dropdownState.isTextDropdownVisible,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            dropdownPosition: position,
          });
          break;
        case "Cell":
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: !dropdownState.isCellDropdownVisible,
            isColorDropdownVisible: false,
            dropdownPosition: position,
          });
          break;
        case "Color":
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: "text",
            colorDropdownPosition: position,
          });
          break;
        case "Fill":
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: "fill",
            colorDropdownPosition: position,
          });
          break;
        case "Border":
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: "border",
            colorDropdownPosition: position,
          });
          break;
        default:
          setDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
          });
      }
    }
    if (
      ["Bold", "Italic", "Strike-through", "Clear Formatting"].includes(item)
    ) {
      onStyleChange(item.toLowerCase().replace("-", ""), null);
      updateDropdownState({
        isTextDropdownVisible: false,
        isCellDropdownVisible: false,
        isColorDropdownVisible: false,
      });
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
      isTextDropdownVisible: false,
      isCellDropdownVisible: false,
      isColorDropdownVisible: false,
    });
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleClickOutside = (event) => {
    if (
      !dropdownState.isTextDropdownVisible &&
      !dropdownState.isCellDropdownVisible &&
      !dropdownState.isColorDropdownVisible
    )
      return;

    if (
      (textButtonRef.current && textButtonRef.current.contains(event.target)) ||
      (cellButtonRef.current && cellButtonRef.current.contains(event.target)) ||
      (tableContainerRef.current &&
        tableContainerRef.current.contains(event.target))
    )
      return;

    setDropdownState({
      isTextDropdownVisible: false,
      isCellDropdownVisible: false,
      isColorDropdownVisible: false,
    });
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownState]);

  return (
    <>
      {menuItems.map((item, index) => {
        const buttonRef =
          item === "Text"
            ? textButtonRef
            : item === "Cell"
            ? cellButtonRef
            : null;
        return (
          <div
            key={index}
            className={styles.secondaryMenuItem}
            onClick={() => handleMenuClick(item, buttonRef)}
          >
            <div ref={buttonRef} className={styles.button}>
              {item}
            </div>
            {item === "Text" && dropdownState.isTextDropdownVisible && (
              <Text
                position={dropdownState.dropdownPosition}
                onStyleChange={onStyleChange}
                stopPropagation={stopPropagation}
                handleMenuClick={handleMenuClick}
                handleColorClick={handleColorClick}
                isColorDropdownVisible={dropdownState.isColorDropdownVisible}
                colorDropdownPosition={dropdownState.colorDropdownPosition}
              />
            )}
            {item === "Cell" && dropdownState.isCellDropdownVisible && (
              <Cell
                position={dropdownState.dropdownPosition}
                stopPropagation={stopPropagation}
                handleMenuClick={handleMenuClick}
                handleColorClick={handleColorClick}
                isColorDropdownVisible={dropdownState.isColorDropdownVisible}
                colorDropdownPosition={dropdownState.colorDropdownPosition}
                colorContext={dropdownState.colorContext}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default FormatMenu;
