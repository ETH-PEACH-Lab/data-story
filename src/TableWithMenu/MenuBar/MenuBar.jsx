import React, { useState } from "react";
import FileMenu from "./FileMenu";
import EditMenu from "./EditMenu";
import FormatMenu from "./FormatMenu";
import InsertMenu from "./InsertMenu";
import DataMenu from "./DataMenu";
import styles from "./MenuBar.module.css";

const MenuBar = ({
  onSaveCurrent,
  onDataLoaded,
  toggleHistory,
  onStyleChange,
  selectedColumnIndex,
  selectedColumnName,
  setColumns,
  columns,
  handleSort,
  handleFilter,
  tableContainerRef,
  countAndRemoveDuplicates,
  addRow,
  addColumn,
  handleFindReplace,
  handleUndo,
  handleRedo,
  hotRef,
  filteredColumns,
  setFilteredColumns,
  showConfirmation,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  initialActionStack,
  initialActionStackLength,
  setInitialActionStack,
  setInitialActionStackLength,
  addChartPage,
  selectedRange,
  aggregateData,
}) => {
  const [activeMenu, setActiveMenu] = useState("");

  const menuOptions = {
    File: (
      <FileMenu
        onSaveCurrent={onSaveCurrent}
        onDataLoaded={onDataLoaded}
        toggleHistory={toggleHistory}
        hotRef={hotRef}
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setConfirmationMessage={setConfirmationMessage}
        setOnConfirmAction={setOnConfirmAction}
        setOnCancelAction={setOnCancelAction}
        initialActionStack={initialActionStack}
        setInitialActionStack={setInitialActionStack}
        initialActionStackLength={initialActionStackLength}
        setInitialActionStackLength={setInitialActionStackLength}
      />
    ),
    Edit: (
      <EditMenu
        countAndRemoveDuplicates={countAndRemoveDuplicates}
        tableContainerRef={tableContainerRef}
        selectedColumnIndex={selectedColumnIndex}
        selectedColumnName={selectedColumnName}
        handleFindReplace={handleFindReplace}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        setColumns={setColumns}
        hotRef={hotRef}
      />
    ),
    Format: (
      <FormatMenu
        onStyleChange={onStyleChange}
        selectedColumnIndex={selectedColumnIndex}
        selectedColumnName={selectedColumnName}
        setColumns={setColumns}
        columns={columns}
        tableContainerRef={tableContainerRef}
        hotRef={hotRef}
      />
    ),
    Insert: (
      <InsertMenu
        addRow={addRow}
        addColumn={addColumn}
        hotRef={hotRef}
        addChartPage={addChartPage}
        selectedRange={selectedRange}
        aggregateData={aggregateData}
      />
    ),
    Data: (
      <DataMenu
        columns={columns}
        selectedColumnIndex={selectedColumnIndex}
        selectedColumnName={selectedColumnName}
        handleSort={handleSort}
        handleFilter={handleFilter}
        tableContainerRef={tableContainerRef}
        hotRef={hotRef}
        filteredColumns={filteredColumns}
        setFilteredColumns={setFilteredColumns}
      />
    ),
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? "" : menu);
  };

  return (
    <div className={styles.menuBarContainer}>
      <div className="container-fluid p-0">
        <div className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            {Object.keys(menuOptions).map((menu, index) => (
              <div
                key={index}
                className={`nav-item ${activeMenu === menu ? "active" : ""}`}
              >
                <button
                  className={`btn ${
                    activeMenu === menu ? "btn-primary" : "btn-light"
                  } mx-2`}
                  onClick={() => handleMenuClick(menu)}
                >
                  {menu}
                </button>
              </div>
            ))}
          </div>
        </div>
        {activeMenu && (
          <div className="secondaryMenuBar bg-light p-2">
            {menuOptions[activeMenu]}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
