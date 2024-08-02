import React, { useMemo, useState, useRef, useEffect } from "react";
import styles from "./StoryMenu.module.css";

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
  const [highlightOption, setHighlightOption] = useState("");
  const [highlightAdditionalOptions, setHighlightAdditionalOptions] = useState(
    []
  );
  const [highlightCondition, setHighlightCondition] = useState("");
  const [highlightValue, setHighlightValue] = useState("");

  const tableButtonRef = useRef(null);
  const columnDropdownRef = useRef(null);
  const highlightButtonRef = useRef(null);
  const highlightDropdownRef = useRef(null);
  const secondaryDropdownRef = useRef(null);

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
      !highlightButtonRef.current.contains(event.target)
    ) {
      setHighlightDropdownVisible(false);
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

  const handleHighlightOptionChange = (e) => {
    const value = e.target.value;
    setHighlightOption(value);
    if (value === "Cells") {
      setHighlightAdditionalOptions(["of all columns", "of all rows", "where"]);
    } else {
      setHighlightAdditionalOptions([]);
    }
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

  const allColumnsSelected = useMemo(() => {
    return selectedColumns.length === columnConfigs.length;
  }, [selectedColumns, columnConfigs]);

  const selectAllColumns = () => {
    setSelectedColumns(columnConfigs.map((column) => column.title));
  };

  const handleAddComponent = (type) => {
    addComponent(type);
    selectAllColumns();
  };

  useEffect(() => {
    if (isHighlightDropdownVisible) {
      setHighlightSelectedColumns(columnConfigs.map((column) => column.title));
    }
  }, [isHighlightDropdownVisible, columnConfigs]);

  const handleSecondaryDropdownToggle = (event) => {
    event.stopPropagation(); // Stop event propagation
    setSecondaryDropdownVisible((prev) => !prev);
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
          Highlight 1
        </button>
        {isHighlightDropdownVisible && (
          <div
            ref={highlightDropdownRef}
            className={styles.dropdown}
            style={{
              top: highlightDropdownPosition.top,
              left: highlightDropdownPosition.left + 134,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.flexContainer}>
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
                      ) : option === "of all columns" ? (
                        <>
                          <span
                            onClick={handleSecondaryDropdownToggle}
                            className={styles.secondaryDropdownToggle}
                          >
                            of all columns
                          </span>
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
      {isSecondaryDropdownVisible && (
        <div
          ref={secondaryDropdownRef}
          className={styles.secondaryDropdown}
          style={{
            top: highlightDropdownPosition.top + 25,
            left: highlightDropdownPosition.left + 348, // Adjust as needed
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the secondary dropdown
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
