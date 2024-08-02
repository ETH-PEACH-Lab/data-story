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
  const [selectedColumns, setSelectedColumns] = useState(
    columnConfigs.map((column) => column.title)
  );

  const tableButtonRef = useRef(null);

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

    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterSelectionEnd");
      }
    };
  }, [hotRef]);

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
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        addComponent={addComponent}
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
