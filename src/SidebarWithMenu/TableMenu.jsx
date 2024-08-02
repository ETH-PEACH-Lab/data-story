import React from "react";
import styles from "./StoryMenu.module.css";

const TableMenu = ({
  columnConfigs,
  tableButtonRef,
  columnDropdownRef,
  isColumnDropdownVisible,
  tableDropdownPosition,
  setTableDropdownPosition, // Accept this prop
  selectedColumns,
  setSelectedColumns,
  setColumnDropdownVisible,
  addComponent,
  highlightButtonRef,
  highlightDropdownRef,
  isHighlightDropdownVisible,
  highlightDropdownPosition,
  setHighlightDropdownPosition, // Accept this prop
  setHighlightDropdownVisible,
  highlightOption,
  setHighlightOption,
  highlightAdditionalOptions,
  setHighlightAdditionalOptions,
  highlightCondition,
  setHighlightCondition,
  highlightValue,
  setHighlightValue,
  updateDropdownPosition,
}) => {
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

  return (
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
              left: highlightDropdownPosition.left + 172,
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
        <button className={styles.button} onClick={() => addComponent("table")}>
          Insert
        </button>
      </div>
    </div>
  );
};

export default TableMenu;
