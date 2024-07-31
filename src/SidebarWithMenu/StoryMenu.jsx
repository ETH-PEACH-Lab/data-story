import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import styles from "./StoryMenu.module.css";

const StoryMenu = ({
  columnConfigs,
  tableContainerRef,
  hotRef,
  setShowConfirmation,
  setConfirmationMessage,
}) => {
  const [activeMenu, setActiveMenu] = useState("");
  const [isFunctionDropdownVisible, setFunctionDropdownVisible] =
    useState(false);
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedRangeState, setSelectedRangeState] = useState(null); // Local state for selected range
  const functionButtonRef = useRef(null);
  const functionDropdownRef = useRef(null);
  const [functionDropdownPosition, setFunctionDropdownPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleMenuClick = (menu) => {
    if (activeMenu === menu) {
      setActiveMenu("");
    } else {
      setActiveMenu(menu);
      setFunctionDropdownVisible(false);
    }
  };

  const calculateFunctionResult = (func, data) => {
    if (!data || data.length === 0) return { result: "No data", warning: "" };

    const convertedData = data.map((row) =>
      row.map((cell) =>
        typeof cell === "string" ? cell.replace(",", ".") : cell
      )
    );

    const numbers = convertedData.map((row) =>
      row.map((cell) => parseFloat(cell)).filter((val) => !isNaN(val))
    );
    const flatNumbers = [].concat(...numbers);

    const hasNonNumericValues = data
      .flat()
      .some((cell) => isNaN(parseFloat(cell.toString().replace(",", "."))));

    let result;
    let warning = "";
    switch (func) {
      case "AVERAGE":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = (
          flatNumbers.reduce((acc, num) => acc + num, 0) / flatNumbers.length
        ).toFixed(2);
        break;
      case "SUM":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = flatNumbers.reduce((acc, num) => acc + num, 0).toFixed(2);
        break;
      case "MAX":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = Math.max(...flatNumbers).toFixed(2);
        break;
      case "MIN":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = Math.min(...flatNumbers).toFixed(2);
        break;
      case "COUNT":
        result = data.flat().length;
        break;
      case "COUNT EMPTY":
        result = data.reduce(
          (acc, row) => acc + row.filter((cell) => cell === "").length,
          0
        );
        break;
      case "COUNT UNIQUE":
        const uniqueValues = new Set(data.flat().filter((cell) => cell !== ""));
        result = uniqueValues.size;
        break;
      default:
        result = "Unknown function";
    }

    if (
      hasNonNumericValues &&
      ["AVERAGE", "SUM", "MAX", "MIN"].includes(func)
    ) {
      warning = "Warning: This function requires numerical values only.";
    }

    return { result, warning };
  };

  const getSelectedCellsData = () => {
    if (!selectedRangeState || !hotRef.current) {
      return [];
    }

    const hotInstance = hotRef.current.hotInstance;
    const { minRow, maxRow, minCol, maxCol } = selectedRangeState;

    return hotInstance.getData(minRow, minCol, maxRow, maxCol);
  };

  const addComponent = (type, column = "", func = "", result = "") => {
    const addEvent = new CustomEvent("addComponent", {
      detail: { type, column, func, result },
    });
    document.dispatchEvent(addEvent);
    setFunctionDropdownVisible(false);
  };

  const handleClickOutside = (event) => {
    if (
      !(
        (functionDropdownRef.current &&
          functionDropdownRef.current.contains(event.target)) ||
        (functionButtonRef.current &&
          functionButtonRef.current.contains(event.target)) ||
        (tableContainerRef.current &&
          tableContainerRef.current.contains(event.target))
      )
    ) {
      setFunctionDropdownVisible(false);
    }
  };

  const updateDropdownPosition = (buttonRef, setDropdownPosition) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY - 131,
      });
    }
  };

  useEffect(() => {
    const hotInstance = hotRef.current?.hotInstance;

    if (hotInstance) {
      hotInstance.addHook("afterSelectionEnd", (r1, c1, r2, c2) => {
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        const allRowsSelected =
          (minCol === 0 && maxCol === hotInstance.countCols() - 1) ||
          minCol === -1;
        const allColsSelected =
          (minRow === 0 && maxRow === hotInstance.countRows() - 1) ||
          minRow === -1;

        setSelectedRangeState({
          minRow: Math.max(minRow, 0),
          maxRow,
          minCol: Math.max(minCol, 0),
          maxCol,
          allRows: allRowsSelected,
          allCols: allColsSelected,
        });
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", () => {
      if (isFunctionDropdownVisible)
        updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
    });

    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterSelectionEnd");
      }
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => {
        if (isFunctionDropdownVisible)
          updateDropdownPosition(
            functionButtonRef,
            setFunctionDropdownPosition
          );
      });
    };
  }, [isFunctionDropdownVisible, hotRef]);

  useLayoutEffect(() => {
    if (isFunctionDropdownVisible) {
      updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
    }
  }, [isFunctionDropdownVisible]);

  const generateRangeString = () => {
    if (!selectedRangeState) return "No range selected";

    if (selectedRangeState.allCols) {
      const colWord =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? "Column"
          : "Columns";
      const colRange =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? `${selectedRangeState.minCol + 1}`
          : `${selectedRangeState.minCol + 1}-${selectedRangeState.maxCol + 1}`;
      return `${colWord}: ${colRange}`;
    } else if (selectedRangeState.allRows) {
      const rowWord =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? "Row"
          : "Rows";
      const rowRange =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? `${selectedRangeState.minRow + 1}`
          : `${selectedRangeState.minRow + 1}-${selectedRangeState.maxRow + 1}`;
      return `${rowWord}: ${rowRange}`;
    } else {
      const rowWord =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? "Row"
          : "Rows";
      const colWord =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? "Column"
          : "Columns";
      const rowRange =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? `${selectedRangeState.minRow + 1}`
          : `${selectedRangeState.minRow + 1}-${selectedRangeState.maxRow + 1}`;
      const colRange =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? `${selectedRangeState.minCol + 1}`
          : `${selectedRangeState.minCol + 1}-${selectedRangeState.maxCol + 1}`;
      return `${rowWord}: ${rowRange}, ${colWord}: ${colRange}`;
    }
  };

  const handleFunctionApply = () => {
    const rangeString = generateRangeString();
    const selectedData = getSelectedCellsData();
    const { result, warning } = calculateFunctionResult(
      selectedFunction,
      selectedData
    );

    if (warning) {
      setConfirmationMessage(warning);
      setShowConfirmation(true);
    } else {
      addComponent("function", rangeString, selectedFunction, result);
    }
  };

  const menuOptions = {
    Text: (
      <div className={styles.secondaryMenuBar}>
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            onClick={() => addComponent("text")}
          >
            Add Text
          </button>
        </div>
      </div>
    ),
    Element: (
      <div className={styles.secondaryMenuBar}>
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            onClick={() => addComponent("chart")}
          >
            Add Chart
          </button>
          <button className={styles.button}>Add Table</button>
        </div>
      </div>
    ),
    Function: (
      <div className={styles.secondaryMenuBar}>
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            onClick={() => {
              setFunctionDropdownVisible(!isFunctionDropdownVisible);
            }}
            ref={functionButtonRef}
          >
            Add Function
          </button>
          {isFunctionDropdownVisible && (
            <div
              className={styles.dropdown}
              style={{
                top: `${functionDropdownPosition.top}px`,
                marginLeft: "69px",
              }}
              ref={functionDropdownRef}
            >
              <div className={styles.dropdownSection}>
                <label className={styles.dropdownTitle}>Selected Range:</label>
                <div className={styles.selectedRangeDisplay}>
                  {generateRangeString()}
                </div>
              </div>
              <div className={styles.dropdownSection}>
                <label className={styles.dropdownTitle}>Select Function:</label>
                <select
                  value={selectedFunction}
                  onChange={(e) => setSelectedFunction(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="" disabled>
                    Select a function
                  </option>
                  {[
                    "AVERAGE",
                    "SUM",
                    "MAX",
                    "MIN",
                    "COUNT",
                    "COUNT EMPTY",
                    "COUNT UNIQUE",
                  ].map((func, index) => (
                    <option key={index} value={func}>
                      {func}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className={styles.applyButton}
                onClick={handleFunctionApply}
              >
                Insert
              </button>
            </div>
          )}
        </div>
      </div>
    ),
  };

  return (
    <div className={styles.menuBarContainer}>
      <div className={styles.menuBar}>
        {Object.keys(menuOptions).map((menu, index) => (
          <div
            key={index}
            className={`${styles.menuItem} ${
              activeMenu === menu ? styles.activeMenuItem : ""
            }`}
            onClick={() => handleMenuClick(menu)}
          >
            <button className={styles.button}>{menu}</button>
          </div>
        ))}
      </div>
      {activeMenu && (
        <div className={styles.secondaryMenuBar}>{menuOptions[activeMenu]}</div>
      )}
    </div>
  );
};

export default StoryMenu;
