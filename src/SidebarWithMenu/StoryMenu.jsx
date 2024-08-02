import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import styles from "./StoryMenu.module.css";
import ChartMenu from "./ChartMenu";
import TextMenu from "./TextMenu";
import TableMenu from "./TableMenu";
import FunctionMenu from "./FunctionMenu";

const StoryMenu = ({
  columnConfigs,
  tableContainerRef,
  hotRef,
  setShowConfirmation,
  setConfirmationMessage,
}) => {
  const [activeMenu, setActiveMenu] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedRangeState, setSelectedRangeState] = useState(null);
  const [isColumnDropdownVisible, setColumnDropdownVisible] = useState(false);
  const [isHighlightDropdownVisible, setHighlightDropdownVisible] =
    useState(false);
  const [highlightOption, setHighlightOption] = useState("");
  const [highlightAdditionalOptions, setHighlightAdditionalOptions] = useState(
    []
  );
  const [highlightCondition, setHighlightCondition] = useState("");
  const [highlightValue, setHighlightValue] = useState("");
  const [tableDropdownPosition, setTableDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
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
  const secondaryDropdownRef = useRef(null);

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

  const getSelectedCellsData = () => {
    if (!selectedRangeState || !hotRef.current) {
      return [];
    }

    const hotInstance = hotRef.current.hotInstance;
    const { minRow, maxRow, minCol, maxCol } = selectedRangeState;

    return hotInstance.getData(minRow, minCol, maxRow, maxCol);
  };

  const handleAddTable = () => {
    addComponent("table");
    setSelectedColumns(columnConfigs.map((column) => column.title));
  };

  const menuOptions = {
    Table: (
      <TableMenu
        columnConfigs={columnConfigs}
        tableButtonRef={tableButtonRef}
        columnDropdownRef={columnDropdownRef}
        isColumnDropdownVisible={isColumnDropdownVisible}
        tableDropdownPosition={tableDropdownPosition}
        setTableDropdownPosition={setTableDropdownPosition} // Pass this down
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        setColumnDropdownVisible={setColumnDropdownVisible}
        addComponent={addComponent}
        highlightButtonRef={highlightButtonRef}
        highlightDropdownRef={highlightDropdownRef}
        isHighlightDropdownVisible={isHighlightDropdownVisible}
        highlightDropdownPosition={highlightDropdownPosition}
        setHighlightDropdownPosition={setHighlightDropdownPosition} // Pass this down
        setHighlightDropdownVisible={setHighlightDropdownVisible}
        highlightOption={highlightOption}
        setHighlightOption={setHighlightOption}
        highlightAdditionalOptions={highlightAdditionalOptions}
        setHighlightAdditionalOptions={setHighlightAdditionalOptions}
        highlightCondition={highlightCondition}
        setHighlightCondition={setHighlightCondition}
        highlightValue={highlightValue}
        setHighlightValue={setHighlightValue}
        updateDropdownPosition={updateDropdownPosition}
        secondaryDropdownRef={secondaryDropdownRef} // Pass this down
      />
    ),
    Function: (
      <FunctionMenu
        selectedRangeState={selectedRangeState}
        getSelectedCellsData={getSelectedCellsData}
        setSelectedFunction={setSelectedFunction}
        selectedFunction={selectedFunction}
        setShowConfirmation={setShowConfirmation}
        setConfirmationMessage={setConfirmationMessage}
        addComponent={addComponent}
      />
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
      {activeMenu === "Chart" && <ChartMenu addComponent={addComponent} />}
      {activeMenu === "Text" && <TextMenu addComponent={addComponent} />}
      {activeMenu === "Table" && menuOptions.Table}
      {activeMenu === "Function" && menuOptions.Function}
    </div>
  );
};

export default StoryMenu;
