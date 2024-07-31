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
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedRangeState, setSelectedRangeState] = useState(null); // Local state for selected range
  const [isColumnDropdownVisible, setColumnDropdownVisible] = useState(false);
  const [tableDropdownPosition, setTableDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [selectedColumns, setSelectedColumns] = useState(
    columnConfigs.map((column) => column.title)
  );
  const tableButtonRef = useRef(null);
  const columnDropdownRef = useRef(null);

  const handleMenuClick = (menu) => {
    if (menu === "Chart") {
      addComponent("chart");
      setActiveMenu("");
    } else if (menu === "Text") {
      addComponent("text");
      setActiveMenu("");
    } else if (activeMenu === menu) {
      setActiveMenu("");
    } else {
      setActiveMenu(menu);
      setColumnDropdownVisible(false); // Ensure dropdown is hidden when switching menus
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
    setColumnDropdownVisible(false);
  };

  const handleClickOutside = (event) => {
    if (
      columnDropdownRef.current &&
      !columnDropdownRef.current.contains(event.target) &&
      !tableButtonRef.current.contains(event.target) // Add this condition
    ) {
      setColumnDropdownVisible(false);
    }
  };

  const updateDropdownPosition = (buttonRef, setDropdownPosition) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
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
      if (isColumnDropdownVisible)
        updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
    });

    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterSelectionEnd");
      }
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => {
        if (isColumnDropdownVisible)
          updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
      });
    };
  }, [isColumnDropdownVisible, hotRef]);

  useLayoutEffect(() => {
    if (isColumnDropdownVisible) {
      updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
    }
  }, [isColumnDropdownVisible]);

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

  const handleAddTable = () => {
    addComponent("table");
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

  const toggleColumnDropdown = (event) => {
    event.stopPropagation(); // Stop event propagation
    setColumnDropdownVisible((prevVisible) => {
      if (!prevVisible) {
        // If dropdown is becoming visible, select all columns
        setSelectedColumns(columnConfigs.map((column) => column.title));
        updateDropdownPosition(tableButtonRef, setTableDropdownPosition); // Update position when opening
      }
      return !prevVisible;
    });
  };

  const menuOptions = {
    Table: (
      <div className={styles.secondaryMenuBar}>
        <div
          className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}
        >
          <button className={styles.button} onClick={toggleColumnDropdown}>
            All columns
          </button>
          {isColumnDropdownVisible && (
            <div
              ref={columnDropdownRef}
              className={styles.dropdown}
              style={{
                top: tableDropdownPosition.top + 35,
                left: tableDropdownPosition.left + 10,
              }}
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
        <div
          className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}
        >
          <select className={styles.selectInput}>
            <option value="">Highlighter 1</option>
          </select>
        </div>
        <div
          className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}
        >
          <select className={styles.selectInput}>
            <option value="">Highlighter 2</option>
          </select>
        </div>
        <div className={styles.secondaryMenuItem}>
          <button className={styles.button} onClick={handleAddTable}>
            Insert
          </button>
        </div>
      </div>
    ),
    Function: (
      <div className={styles.secondaryMenuBar}>
        <div
          className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}
        >
          {generateRangeString()}
        </div>
        <div
          className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}
        >
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
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            onClick={handleFunctionApply}
            disabled={!selectedRangeState || !selectedFunction}
          >
            Insert
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className={styles.menuBarContainer}>
      <div className={styles.menuBar}>
        <div
          className={`${styles.menuItem} ${
            activeMenu === "Chart" ? styles.activeMenuItem : ""
          }`}
          onClick={() => handleMenuClick("Chart")}
        >
          <button className={styles.button}>Chart</button>
        </div>
        <div
          className={`${styles.menuItem} ${
            activeMenu === "Table" ? styles.activeMenuItem : ""
          }`}
          onClick={() => handleMenuClick("Table")}
        >
          <button className={styles.button}>Table</button>
        </div>
        <div
          className={`${styles.menuItem} ${
            activeMenu === "Function" ? styles.activeMenuItem : ""
          }`}
          onClick={() => handleMenuClick("Function")}
        >
          <button className={styles.button}>Function</button>
        </div>
        <div
          className={`${styles.menuItem} ${
            activeMenu === "Text" ? styles.activeMenuItem : ""
          }`}
          onClick={() => handleMenuClick("Text")}
        >
          <button className={styles.button}>Text</button>
        </div>
      </div>
      {activeMenu && activeMenu !== "Text" && activeMenu !== "Chart" && (
        <div className={styles.secondaryMenuBar}>{menuOptions[activeMenu]}</div>
      )}
    </div>
  );
};

export default StoryMenu;
