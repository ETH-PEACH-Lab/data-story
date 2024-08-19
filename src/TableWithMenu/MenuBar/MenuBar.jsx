import React, { useState } from "react";
import FileMenu from "./FileMenu";
import EditMenu from "./EditMenu";
import FormatMenu from "./FormatMenu";
import InsertMenu from "./InsertMenu";
import DataMenu from "./DataMenu";

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
  const [hoveredMenu, setHoveredMenu] = useState(null);

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
        setShowConfirmation={setShowConfirmation}
        setConfirmationMessage={setConfirmationMessage}
        setOnConfirmAction={setOnConfirmAction}
        setOnCancelAction={setOnCancelAction}
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

  const handleMouseEnter = (menu) => {
    setHoveredMenu(menu);
  };

  const handleMouseLeave = () => {
    setHoveredMenu(null);
  };

  const accordionContainerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    background: "#e3e1d9",
    zIndex: 60,
  };

  const accordionItemStyle = {
    textAlign: "left",
    border: "none",
    flex: "0 0 auto",
  };

  const accordionHeaderStyle = {
    padding: 0,
    background: "transparent",
  };

  const getButtonStyle = (menu, isActive) => ({
    borderRadius: "5px 5px 0 0",
    backgroundColor:
      menu === hoveredMenu
        ? "var(--primary-light)"
        : isActive
        ? "var(--primary)"
        : "var(--light)",
    color:
      menu === hoveredMenu
        ? "var(--light)"
        : isActive
        ? "var(--light)"
        : "var(--dark)",
    border: "1px solid var(--dark)",
    outline: "none",
    flexShrink: 0,
    width: "auto",
    height: "40px",
    textAlign: "left",
    cursor: "pointer",
  });

  const accordionCollapseStyle = {
    width: "100%",
  };

  const accordionBodyStyle = {
    border: "1px solid var(--border-color)",
    borderTop: "none",
    background: "var(--light)",
    zIndex: 1000,
  };

  const headerContainerStyle = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: "0px",
    flexWrap: "nowrap",
    flexGrow: 0,
  };

  return (
    <div style={accordionContainerStyle}>
      <div className="accordion" id="menuAccordion">
        <div style={headerContainerStyle}>
          {Object.keys(menuOptions).map((menu, index) => (
            <div
              key={index}
              style={accordionItemStyle}
              className="accordion-item"
            >
              <h2 style={accordionHeaderStyle} className="accordion-header">
                <button
                  style={getButtonStyle(menu, activeMenu === menu)}
                  className={`accordion-button ${
                    activeMenu === menu ? "" : "collapsed"
                  }`}
                  type="button"
                  onClick={() => handleMenuClick(menu)}
                  onMouseEnter={() => handleMouseEnter(menu)}
                  onMouseLeave={handleMouseLeave}
                >
                  {menu + "\u00A0" + "\u00A0"}
                </button>
              </h2>
            </div>
          ))}
        </div>
        {Object.keys(menuOptions).map((menu, index) => (
          <div
            key={index}
            id={`collapse${index}`}
            className={`accordion-collapse collapse ${
              activeMenu === menu ? "show" : ""
            }`}
            aria-labelledby={`heading${index}`}
            data-bs-parent="#menuAccordion"
            style={accordionCollapseStyle}
          >
            <div className="accordion-body p-2" style={accordionBodyStyle}>
              {menuOptions[menu]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
