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
  const [highlightAdditionalOptions, setHighlightAdditionalOptions] = useState(
    []
  );
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedRangeState, setSelectedRangeState] = useState(null);
  const [isColumnDropdownVisible, setColumnDropdownVisible] = useState(false);
  const [isHighlightDropdownVisible, setHighlightDropdownVisible] =
    useState(false);
  const [highlightOption, setHighlightOption] = useState("");
  const [tableDropdownPosition, setTableDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [highlightCondition, setHighlightCondition] = useState("");
  const [highlightValue, setHighlightValue] = useState("");
  const [highlightDropdownPosition, setHighlightDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [selectedColumns, setSelectedColumns] = useState(
    columnConfigs.map((column) => column.title)
  );
  const tableButtonRef = useRef(null);
  const columnDropdownRef = useRef(null);
  const highlightButtonRef = useRef(null);
  const highlightDropdownRef = useRef(null);

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
      setColumnDropdownVisible(false);
      setHighlightDropdownVisible(false);

      if (menu === "Table") {
        setSelectedColumns(columnConfigs.map((column) => column.title));
      }
    }
  };

  const handleHighlightConditionChange = (e) => {
    setHighlightCondition(e.target.value);
  };

  const handleHighlightValueChange = (e) => {
    setHighlightValue(e.target.value);
  };

  const handleHighlightOptionChange = (e) => {
    const value = e.target.value;
    setHighlightOption(value);
    if (value === "Cells") {
      setHighlightAdditionalOptions(["of all columns", "of all rows", "where"]);
    } else {
      setHighlightAdditionalOptions([]);
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
    setHighlightDropdownVisible(false); // Hide highlight dropdown on component add
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
      !highlightButtonRef.current.contains(event.target)
    ) {
      setHighlightDropdownVisible(false);
    }
  };

  const updateDropdownPosition = (buttonRef, setDropdownPosition) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: 0 + window.scrollY,
        left: 0 + window.scrollX,
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
      if (isHighlightDropdownVisible)
        updateDropdownPosition(
          highlightButtonRef,
          setHighlightDropdownPosition
        );
    });

    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterSelectionEnd");
      }
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
  }, [isColumnDropdownVisible, isHighlightDropdownVisible, hotRef]);

  useLayoutEffect(() => {
    if (isColumnDropdownVisible) {
      updateDropdownPosition(tableButtonRef, setTableDropdownPosition);
    }
    if (isHighlightDropdownVisible) {
      updateDropdownPosition(highlightButtonRef, setHighlightDropdownPosition);
    }
  }, [isColumnDropdownVisible, isHighlightDropdownVisible]);

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
    setSelectedColumns(columnConfigs.map((column) => column.title));
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
        updateDropdownPosition(tableButtonRef, setTableDropdownPosition); // Update position when opening
      }
      return !prevVisible;
    });
  };

  const toggleHighlightDropdown = (event) => {
    event.stopPropagation(); // Stop event propagation
    setHighlightDropdownVisible((prevVisible) => {
      if (!prevVisible) {
        updateDropdownPosition(
          highlightButtonRef,
          setHighlightDropdownPosition
        ); // Update position when opening
      }
      return !prevVisible;
    });
  };

  const menuOptions = {
    Table: (
      <div className={styles.secondaryMenuBar}>
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            ref={tableButtonRef}
            onClick={toggleColumnDropdown}
          >
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
        <div className={styles.secondaryMenuItem}>
          <button
            className={styles.button}
            ref={highlightButtonRef}
            onClick={toggleHighlightDropdown}
          >
            Highlight 1
          </button>
          {isHighlightDropdownVisible && (
            <div
              ref={highlightDropdownRef}
              className={styles.dropdown}
              style={{
                top: highlightDropdownPosition.top + 35,
                left: highlightDropdownPosition.left + 177,
              }}
            >
              <div className={styles.textOption}>
                <span>Select</span>
                <select
                  value={highlightOption}
                  onChange={handleHighlightOptionChange}
                  className={styles.selectInput}
                >
                  <option value="">nothing</option>
                  <option value="Columns">Columns</option>
                  <option value="Rows">Rows</option>
                  <option value="Cells">Cells</option>
                </select>
              </div>
              {highlightOption === "Cells" &&
                highlightAdditionalOptions.length > 0 && (
                  <div className={styles.additionalOptions}>
                    {highlightAdditionalOptions.map((option, index) => (
                      <div key={index} className={styles.textOption}>
                        {option === "where" ? (
                          <>
                            <span>where</span>
                            <select
                              value={highlightCondition}
                              onChange={handleHighlightConditionChange}
                              className={styles.selectInput}
                            >
                              <option value="empty">empty</option>
                              <option value="not empty">not empty</option>
                              <option value="is equal">is equal</option>
                              <option value="is not equal">is not equal</option>
                              <option value="is bigger than">
                                is bigger than
                              </option>
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
                              <option value="does not contain">
                                does not contain
                              </option>
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
                          </>
                        ) : (
                          <span>{option}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
        <div className={styles.secondaryMenuItem}>
          <button className={styles.button}>Highlight 2</button>
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
