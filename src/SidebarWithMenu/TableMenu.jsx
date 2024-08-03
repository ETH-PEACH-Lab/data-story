import React, { useMemo, useState, useRef, useEffect } from "react";
import styles from "./StoryMenu.module.css";
import { CirclePicker } from "react-color";

const TableMenu = ({
  columnConfigs,
  selectedColumns,
  setSelectedColumns,
  addComponent,
}) => {
  const [visibleDropdown, setVisibleDropdown] = useState(null);
  const [isSecondaryDropdownVisible, setSecondaryDropdownVisible] =
    useState(false);

  const tableButtonRef = useRef(null);
  const highlightButtonRef1 = useRef(null);
  const highlightButtonRef2 = useRef(null);
  const columnDropdownRef = useRef(null);
  const highlightDropdownRef1 = useRef(null);
  const highlightDropdownRef2 = useRef(null);
  const secondaryDropdownRef = useRef(null);

  const refs = [
    columnDropdownRef,
    tableButtonRef,
    highlightDropdownRef1,
    highlightButtonRef1,
    highlightDropdownRef2,
    highlightButtonRef2,
    secondaryDropdownRef,
  ];

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

  const initialHighlightSettings = {
    selectedColumns: [],
    isEnabled: false,
    condition: "no condition",
    value: "",
    columnSelection: "of all columns",
    rowSelection: "of all rows",
    rowRange: "",
  };

  const initialHighlightColors = [
    tintColor("#0AEFFF", 60),
    tintColor("#FF8700", 60),
  ];

  const [highlightSettings, setHighlightSettings] = useState([
    { ...initialHighlightSettings },
    { ...initialHighlightSettings },
  ]);

  const [highlightColors, setHighlightColors] = useState(
    initialHighlightColors
  );
  const [colorPickerVisible, setColorPickerVisible] = useState([false, false]);

  const [dropdownPositions, setDropdownPositions] = useState([
    { top: 0, left: 0 },
    { top: 0, left: 0 },
  ]);

  const updateDropdownPosition = (index, buttonRef) => {
    if (buttonRef.current) {
      const { top, left } = buttonRef.current.getBoundingClientRect();
      setDropdownPositions((prev) => {
        const newPositions = [...prev];
        newPositions[index] = {
          top: 35 + window.scrollY,
          left: 10 + window.scrollX,
        };
        return newPositions;
      });
    }
  };

  const toggleDropdown = (index, ref) => (event) => {
    event.stopPropagation();
    setVisibleDropdown((prevVisible) => {
      const newVisibleDropdown = prevVisible !== index ? index : null;
      if (newVisibleDropdown !== null) {
        updateDropdownPosition(index, ref);
      }
      setSecondaryDropdownVisible(false);
      return newVisibleDropdown;
    });
  };

  const handleHighlightCheckboxChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, isEnabled: e.target.checked } : settings
      )
    );
  };

  const handleHighlightConditionChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, condition: e.target.value } : settings
      )
    );
  };

  const handleHighlightValueChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, value: e.target.value } : settings
      )
    );
  };

  const handleRowRangeChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, rowRange: e.target.value } : settings
      )
    );
  };

  const handleHighlightColumnSelect = (index, column) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index
          ? {
              ...settings,
              selectedColumns: settings.selectedColumns.includes(column)
                ? settings.selectedColumns.filter((col) => col !== column)
                : [...settings.selectedColumns, column],
            }
          : settings
      )
    );
  };

  const handleColorChangeComplete = (index) => (color) => {
    setHighlightColors((prev) =>
      prev.map((col, i) => (i === index ? color.hex : col))
    );
    setColorPickerVisible((prev) =>
      prev.map((visible, i) => (i === index ? false : visible))
    );
  };

  const handleClickOutside = (event) => {
    const isClickOutsideDropdowns = !refs.some(
      (ref) => ref.current && ref.current.contains(event.target)
    );
    if (isClickOutsideDropdowns) {
      setVisibleDropdown(null);
      setSecondaryDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", () => {
      if (visibleDropdown !== null) {
        updateDropdownPosition(visibleDropdown, refs[visibleDropdown]);
      }
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => {
        if (visibleDropdown !== null) {
          updateDropdownPosition(visibleDropdown, refs[visibleDropdown]);
        }
      });
    };
  }, [visibleDropdown]);

  const handleColumnSelect = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const allColumnsSelected = useMemo(
    () => selectedColumns.length === columnConfigs.length,
    [selectedColumns, columnConfigs]
  );

  const selectAllColumns = () =>
    setSelectedColumns(columnConfigs.map((column) => column.title));

  const resetHighlightSettings = (
    setHighlightSettings,
    setHighlightColor,
    initialColor
  ) => {
    setSecondaryDropdownVisible(false);
    setHighlightSettings({
      selectedColumns: [],
      isEnabled: false,
      condition: "no condition",
      value: "",
      columnSelection: "of all columns",
      rowSelection: "of all rows",
      rowRange: "",
    });
    setHighlightColor(tintColor(initialColor, 60));
  };

  const handleInsertComponent = (componentType) => {
    console.log("highlightSettings before insert:", highlightSettings);
    console.log("highlightColors before insert:", highlightColors);

    addComponent(
      componentType,
      selectedColumns,
      highlightSettings,
      highlightColors
    );

    selectAllColumns();
    resetHighlightSettings(
      (settings) =>
        setHighlightSettings((prev) =>
          prev.map((s, i) => (i === 0 ? settings : s))
        ),
      (color) =>
        setHighlightColors((prev) => prev.map((c, i) => (i === 0 ? color : c))),
      "#0AEFFF"
    );
    resetHighlightSettings(
      (settings) =>
        setHighlightSettings((prev) =>
          prev.map((s, i) => (i === 1 ? settings : s))
        ),
      (color) =>
        setHighlightColors((prev) => prev.map((c, i) => (i === 1 ? color : c))),
      "#FF8700"
    );
  };

  const HighlightDropdownContent = ({
    index,
    highlightSettings,
    setHighlightSettings,
    highlightColor,
    setHighlightColor,
    colorPickerVisible,
    setColorPickerVisible,
    allColors,
  }) => (
    <>
      <div className={styles.textOption}>
        <div className={styles.flexContainer}>
          <input
            type="checkbox"
            checked={highlightSettings.isEnabled}
            onChange={handleHighlightCheckboxChange(index)}
          />
          <span>Enable Highlight</span>
          <div
            onClick={() =>
              setColorPickerVisible((prev) =>
                prev.map((visible, i) => (i === index ? !visible : visible))
              )
            }
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
                left: "216px",
                top: "0px",
                padding: "10px",
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
                onClick={() =>
                  setColorPickerVisible((prev) =>
                    prev.map((visible, i) => (i === index ? false : visible))
                  )
                }
              />
              <CirclePicker
                color={highlightColor}
                colors={allColors}
                onChangeComplete={handleColorChangeComplete(index)}
              />
            </div>
          )}
        </div>
      </div>
      {highlightSettings.isEnabled && (
        <>
          <div className={styles.textOption}>
            <div className={styles.flexContainer}>
              <select
                value={highlightSettings.columnSelection}
                onChange={(e) =>
                  setHighlightSettings((prev) =>
                    prev.map((settings, i) =>
                      i === index
                        ? { ...settings, columnSelection: e.target.value }
                        : settings
                    )
                  )
                }
                className={styles.selectInput}
              >
                <option value="of all columns">of all columns</option>
                <option value="of selected columns">of selected columns</option>
              </select>
              {highlightSettings.columnSelection === "of selected columns" && (
                <button
                  className={styles.applyButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSecondaryDropdownVisible((prev) => !prev);
                  }}
                >
                  Select
                </button>
              )}
            </div>
          </div>
          <div className={styles.textOption}>
            <div className={styles.flexContainer}>
              <select
                value={highlightSettings.rowSelection}
                onChange={(e) =>
                  setHighlightSettings((prev) =>
                    prev.map((settings, i) =>
                      i === index
                        ? { ...settings, rowSelection: e.target.value }
                        : settings
                    )
                  )
                }
                className={styles.selectInput}
              >
                <option value="of all rows">of all rows</option>
                <option value="of range of rows">of range of rows</option>
              </select>
              {highlightSettings.rowSelection === "of range of rows" && (
                <input
                  type="text"
                  placeholder="e.g., 1-5"
                  value={highlightSettings.rowRange}
                  onChange={handleRowRangeChange(index)}
                  className={styles.inputField}
                  style={{ width: "50%" }}
                />
              )}
            </div>
          </div>
          <div className={styles.textOption}>
            <div className={styles.flexContainer}>
              <span>where</span>
              <select
                value={highlightSettings.condition}
                onChange={handleHighlightConditionChange(index)}
                className={styles.selectInput}
              >
                <option value="no condition">no condition</option>
                <option value="empty">empty</option>
                <option value="not empty">not empty</option>
                <option value="is equal">is equal</option>
                <option value="is not equal">is not equal</option>
                <option value="is bigger than">is bigger than</option>
                <option value="is bigger than or equal">
                  is bigger than or equal
                </option>
                <option value="is less than">is less than</option>
                <option value="is less than or equal">
                  is less than or equal
                </option>
                <option value="begins with">begins with</option>
                <option value="ends with">ends with</option>
                <option value="contains">contains</option>
                <option value="does not contain">does not contain</option>
              </select>
              {[
                "is equal",
                "is not equal",
                "begins with",
                "ends with",
                "contains",
                "does not contain",
                "is bigger than",
                "is bigger than or equal",
                "is less than",
                "is less than or equal",
              ].includes(highlightSettings.condition) && (
                <input
                  type="text"
                  value={highlightSettings.value}
                  onChange={handleHighlightValueChange(index)}
                  className={styles.inputField}
                  style={{ width: "50%" }}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={styles.secondaryMenuBar}>
      <div className={styles.secondaryMenuItem}>
        <button
          className={styles.button}
          ref={tableButtonRef}
          onClick={toggleDropdown(0, tableButtonRef)}
        >
          {allColumnsSelected ? "All columns" : "of selected columns"}
        </button>
        {visibleDropdown === 0 && (
          <div
            ref={columnDropdownRef}
            className={styles.dropdown}
            style={{
              top: dropdownPositions[0]?.top,
              left: dropdownPositions[0]?.left,
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
      {[1, 2].map((i) => (
        <div className={styles.secondaryMenuItem} key={i}>
          <button
            className={styles.button}
            ref={i === 1 ? highlightButtonRef1 : highlightButtonRef2}
            onClick={toggleDropdown(
              i,
              i === 1 ? highlightButtonRef1 : highlightButtonRef2
            )}
          >
            {`Highlight ${i}`}
          </button>
          {visibleDropdown === i && (
            <div
              ref={i === 1 ? highlightDropdownRef1 : highlightDropdownRef2}
              className={`${styles.dropdown} ${styles.highlightDropdown}`}
              style={{
                top: dropdownPositions[i]?.top,
                left: dropdownPositions[i]?.left + (i === 1 ? 162 : 317),
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSecondaryDropdownVisible(false);
              }}
            >
              <HighlightDropdownContent
                index={i - 1}
                highlightSettings={highlightSettings[i - 1]}
                setHighlightSettings={setHighlightSettings}
                highlightColor={highlightColors[i - 1]}
                setHighlightColor={setHighlightColors}
                colorPickerVisible={colorPickerVisible[i - 1]}
                setColorPickerVisible={setColorPickerVisible}
                allColors={allColors}
              />
            </div>
          )}
        </div>
      ))}
      {isSecondaryDropdownVisible && (
        <div
          ref={secondaryDropdownRef}
          className={styles.secondaryDropdown}
          style={{
            top:
              visibleDropdown === 1
                ? dropdownPositions[1]?.top + 25
                : dropdownPositions[2]?.top + 25,
            left:
              visibleDropdown === 1
                ? dropdownPositions[1]?.left + 380
                : dropdownPositions[2]?.left + 380,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {columnConfigs.map((column, index) => (
            <div
              key={index}
              className={styles.textOption}
              onClick={() =>
                handleHighlightColumnSelect(visibleDropdown - 1, column.title)
              }
            >
              <input
                type="checkbox"
                checked={
                  visibleDropdown === 1
                    ? highlightSettings[0].selectedColumns.includes(
                        column.title
                      )
                    : highlightSettings[1].selectedColumns.includes(
                        column.title
                      )
                }
                readOnly
              />
              {column.title}
            </div>
          ))}
        </div>
      )}
      <div className={styles.secondaryMenuItem}>
        <button
          className={styles.button}
          onClick={() => handleInsertComponent("table")}
        >
          Insert
        </button>
      </div>
    </div>
  );
};

export default TableMenu;
