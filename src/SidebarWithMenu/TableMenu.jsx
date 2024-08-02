import React, { useMemo, useState, useRef, useEffect } from "react";
import styles from "./StoryMenu.module.css";
import { CirclePicker } from "react-color";

const TableMenu = ({
  columnConfigs,
  selectedColumns,
  setSelectedColumns,
  addComponent,
}) => {
  const [isColumnDropdownVisible, setColumnDropdownVisible] = useState(false);
  const [isHighlightDropdownVisible, setHighlightDropdownVisible] =
    useState(false);
  const [tableDropdownPosition, setTableDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [highlightDropdownPosition, setHighlightDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isSecondaryDropdownVisible, setSecondaryDropdownVisible] =
    useState(false);
  const [highlightSelectedColumns, setHighlightSelectedColumns] = useState([]);
  const [isHighlightEnabled, setHighlightEnabled] = useState(false);
  const [highlightCondition, setHighlightCondition] = useState("nothing");
  const [highlightValue, setHighlightValue] = useState("");
  const [highlightColumnSelection, setHighlightColumnSelection] =
    useState("of all columns");
  const [highlightRowSelection, setHighlightRowSelection] =
    useState("of all rows");
  const [isCurrentlySelected, setIsCurrentlySelected] = useState(false);
  const [highlightColor, setHighlightColor] = useState(
    tintColor("#0AEFFF", 60)
  );
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const tableButtonRef = useRef(null);
  const columnDropdownRef = useRef(null);
  const highlightButtonRef = useRef(null);
  const highlightDropdownRef = useRef(null);
  const secondaryDropdownRef = useRef(null);

  const originalColors = [
    "#000000",
    "#AB14E2",
    "#FF0000",
    "#FF8700",
    "#FFD300",
    "#0AEFFF",
    "#580AFF",
    "#1C7B53",
    "#A1FF0A",
  ];

  function tintColor(color, percentage) {
    const decimalPercentage = percentage / 100;
    const hex = color.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.round(r + (255 - r) * decimalPercentage);
    const newG = Math.round(g + (255 - g) * decimalPercentage);
    const newB = Math.round(b + (255 - b) * decimalPercentage);

    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  const tintedColors = originalColors.map((color) => tintColor(color, 60));

  const allColors = [...originalColors, ...tintedColors];

  const updateDropdownPosition = (buttonRef, setDropdownPosition) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: 35 + window.scrollY,
        left: 10 + window.scrollX,
      });
    }
  };

  const handleClickOutside = (event) => {
    if (
      columnDropdownRef.current &&
      !columnDropdownRef.current.contains(event.target) &&
      !tableButtonRef.current.contains(event.target)
    ) {
      setColumnDropdownVisible(false);
    }
    if (
      highlightDropdownRef.current &&
      !highlightDropdownRef.current.contains(event.target) &&
      !highlightButtonRef.current.contains(event.target) &&
      (!secondaryDropdownRef.current ||
        !secondaryDropdownRef.current.contains(event.target))
    ) {
      setHighlightDropdownVisible(false);
      setSecondaryDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", () => {
      if (isColumnDropdownVisible)
        updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
      if (isHighlightDropdownVisible)
        updateDropdownPosition(
          highlightButtonRef,
          setHighlightDropdownPosition
        );
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => {
        if (isColumnDropdownVisible)
          updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
        if (isHighlightDropdownVisible)
          updateDropdownPosition(
            highlightButtonRef,
            setHighlightDropdownPosition
          );
      });
    };
  }, [isColumnDropdownVisible, isHighlightDropdownVisible]);

  const handleHighlightConditionChange = (e) => {
    setHighlightCondition(e.target.value);
  };

  const handleHighlightValueChange = (e) => {
    setHighlightValue(e.target.value);
  };

  const handleColumnSelect = (column) => {
    setSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleHighlightColumnSelect = (column) => {
    setHighlightSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const toggleColumnDropdown = (event) => {
    event.stopPropagation();
    setColumnDropdownVisible((prevVisible) => {
      if (!prevVisible) {
        updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
      }
      return !prevVisible;
    });
  };

  const toggleHighlightDropdown = (event) => {
    event.stopPropagation();
    setHighlightDropdownVisible((prevVisible) => {
      if (!prevVisible) {
        updateDropdownPosition(
          highlightButtonRef,
          setHighlightDropdownPosition
        );
      }
      return !prevVisible;
    });
  };

  const allColumnsSelected = useMemo(() => {
    return selectedColumns.length === columnConfigs.length;
  }, [selectedColumns, columnConfigs]);

  const selectAllColumns = () => {
    setSelectedColumns(columnConfigs.map((column) => column.title));
  };

  const resetHighlightDropdown = () => {
    setSecondaryDropdownVisible(false);
    setHighlightSelectedColumns([]);
    setHighlightEnabled(false);
    setIsCurrentlySelected(false);
    setHighlightColumnSelection("of all columns");
    setHighlightRowSelection("of all rows");
    setHighlightCondition("nothing");
    setHighlightValue("");
    setHighlightColor(tintColor("#0AEFFF", 60));
  };

  const handleAddComponent = (type) => {
    addComponent(type);
    selectAllColumns();
    resetHighlightDropdown();
  };

  const handleSecondaryDropdownToggle = (event) => {
    event.stopPropagation();
    setSecondaryDropdownVisible((prev) => !prev);
  };

  const handlePrimaryDropdownClick = (event) => {
    event.stopPropagation();
    setSecondaryDropdownVisible(false);
  };

  const handleHighlightCheckboxChange = (e) => {
    setHighlightEnabled(e.target.checked);
  };

  const handleHighlightRowSelectionChange = (e) => {
    setHighlightRowSelection(e.target.value);
  };

  const handleCurrentlySelectedCheckboxChange = (e) => {
    setIsCurrentlySelected(e.target.checked);
  };

  const handleColorChangeComplete = (color) => {
    setHighlightColor(color.hex);
    setColorPickerVisible(false);
  };

  return (
    <div className={styles.secondaryMenuBar}>
      <div className={styles.secondaryMenuItem}>
        <button
          className={styles.button}
          ref={tableButtonRef}
          onClick={toggleColumnDropdown}
        >
          {allColumnsSelected ? "All columns" : "of selected columns"}
        </button>
        {isColumnDropdownVisible && (
          <div
            ref={columnDropdownRef}
            className={styles.dropdown}
            style={{
              top: tableDropdownPosition.top,
              left: tableDropdownPosition.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {columnConfigs.map((column, index) => (
              <div
                key={index}
                className={styles.textOption}
                onClick={() => handleColumnSelect(column.title)}
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column.title)}
                  readOnly
                />
                {column.title}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.secondaryMenuItem}>
        <button
          className={styles.button}
          ref={highlightButtonRef}
          onClick={toggleHighlightDropdown}
        >
          {allColumnsSelected ? "of all columns" : "of selected columns"}
        </button>
        {isHighlightDropdownVisible && (
          <div
            ref={highlightDropdownRef}
            className={`${styles.dropdown} ${styles.highlightDropdown}`}
            style={{
              top: highlightDropdownPosition.top,
              left: highlightDropdownPosition.left + 134,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrimaryDropdownClick(e);
            }}
          >
            <div className={styles.textOption}>
              <div className={styles.flexContainer}>
                <input
                  type="checkbox"
                  checked={isHighlightEnabled}
                  onChange={handleHighlightCheckboxChange}
                />
                <span>Enable Highlight</span>
                <div
                  onClick={() => setColorPickerVisible(!colorPickerVisible)}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: highlightColor,
                    marginLeft: "10px",
                    cursor: "pointer",
                    border: "1px solid #000",
                  }}
                />
                {colorPickerVisible && (
                  <div
                    style={{
                      display: "flex",
                      position: "absolute",
                      maxWidth: "245px",
                      zIndex: 2,
                      left: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                      }}
                      onClick={() => setColorPickerVisible(false)}
                    />
                    <CirclePicker
                      color={highlightColor}
                      colors={allColors}
                      onChangeComplete={handleColorChangeComplete}
                    />
                  </div>
                )}
              </div>
            </div>
            {isHighlightEnabled && (
              <>
                <div className={styles.textOption}>
                  <div className={styles.flexContainer}>
                    <select
                      value={highlightColumnSelection}
                      onChange={(e) =>
                        setHighlightColumnSelection(e.target.value)
                      }
                      className={styles.selectInput}
                    >
                      <option value="of all columns">of all columns</option>
                      <option value="of selected columns">
                        of selected columns
                      </option>
                    </select>
                    {highlightColumnSelection === "of selected columns" && (
                      <button
                        className={styles.applyButton}
                        onClick={handleSecondaryDropdownToggle}
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.textOption}>
                  <div className={styles.flexContainer}>
                    <select
                      value={highlightRowSelection}
                      onChange={handleHighlightRowSelectionChange}
                      className={styles.selectInput}
                    >
                      <option value="of all rows">of all rows</option>
                      <option value="of range of rows">of range of rows</option>
                    </select>
                    {highlightRowSelection === "of range of rows" && (
                      <input
                        type="text"
                        placeholder="e.g., 1-5"
                        className={styles.inputField}
                        style={{ width: "50%" }}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.textOption}>
                  <div className={styles.flexContainer}>
                    <input
                      type="checkbox"
                      checked={isCurrentlySelected}
                      onChange={handleCurrentlySelectedCheckboxChange}
                    />
                    <span>if currently selected</span>
                  </div>
                </div>
                <div className={styles.textOption}>
                  <div className={styles.flexContainer}>
                    <span>where</span>
                    <select
                      value={highlightCondition}
                      onChange={handleHighlightConditionChange}
                      className={styles.selectInput}
                    >
                      <option value="any value">any value</option>
                      <option value="empty">empty</option>
                      <option value="not empty">not empty</option>
                      <option value="is equal">is equal</option>
                      <option value="is not equal">is not equal</option>
                      <option value="is bigger than">is bigger than</option>
                      <option value="is bigger or equal than">
                        is bigger or equal than
                      </option>
                      <option value="is less than">is less than</option>
                      <option value="is less or equal than">
                        is less or equal than
                      </option>
                      <option value="begins with">begins with</option>
                      <option value="ends with">ends with</option>
                      <option value="contains">contains</option>
                      <option value="does not contain">does not contain</option>
                      <option value="currently selected">
                        currently selected
                      </option>
                    </select>
                    {[
                      "is equal",
                      "is not equal",
                      "begins with",
                      "ends with",
                      "contains",
                      "does not contain",
                      "is bigger than",
                      "is bigger or equal than",
                      "is less than",
                      "is less or equal than",
                    ].includes(highlightCondition) && (
                      <input
                        type="text"
                        value={highlightValue}
                        onChange={handleHighlightValueChange}
                        className={styles.inputField}
                        style={{ width: "50%" }}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {isSecondaryDropdownVisible && (
        <div
          ref={secondaryDropdownRef}
          className={styles.secondaryDropdown}
          style={{
            top: highlightDropdownPosition.top + 25,
            left: highlightDropdownPosition.left + 380,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {columnConfigs.map((column, index) => (
            <div
              key={index}
              className={styles.textOption}
              onClick={() => handleHighlightColumnSelect(column.title)}
            >
              <input
                type="checkbox"
                checked={highlightSelectedColumns.includes(column.title)}
                readOnly
              />
              {column.title}
            </div>
          ))}
        </div>
      )}
      <div className={styles.secondaryMenuItem}>
        <button className={styles.button}>Highlight 2</button>
      </div>
      <div className={styles.secondaryMenuItem}>
        <button
          className={styles.button}
          onClick={() => handleAddComponent("table")}
        >
          Insert
        </button>
      </div>
    </div>
  );
};

export default TableMenu;
