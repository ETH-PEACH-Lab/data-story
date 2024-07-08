import React, { useState, useRef } from 'react';
import styles from './MenuBar.module.css';
import Papa from 'papaparse';
import FileMenu from './FileMenu';
import EditMenu from './EditMenu';
import FormatMenu from './FormatMenu';
import InsertMenu from './InsertMenu';
import DataMenu from './DataMenu';

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
}) => {
  const [activeMenu, setActiveMenu] = useState('');
  const fileInputRef = useRef(null);

  const menuOptions = {
    'File': <FileMenu 
              onSaveCurrent={onSaveCurrent} 
              onDataLoaded={onDataLoaded} 
              toggleHistory={toggleHistory} 
              fileInputRef={fileInputRef} 
              hotRef={hotRef}
              showConfirmation={showConfirmation}
              setShowConfirmation={setShowConfirmation}
              setConfirmationMessage={setConfirmationMessage}
              setOnConfirmAction={setOnConfirmAction}
              setOnCancelAction={setOnCancelAction}
              initialActionStack={initialActionStack}
              initialActionStackLength={initialActionStackLength}
            />,
    'Edit': <EditMenu 
              countAndRemoveDuplicates={countAndRemoveDuplicates}
              tableContainerRef={tableContainerRef}
              selectedColumnIndex={selectedColumnIndex}
              selectedColumnName={selectedColumnName}
              handleFindReplace={handleFindReplace}
              handleUndo={handleUndo}
              handleRedo={handleRedo}
            />,
    'Format': <FormatMenu 
                onStyleChange={onStyleChange} 
                selectedColumnIndex={selectedColumnIndex} 
                selectedColumnName={selectedColumnName} 
                setColumns={setColumns} 
                columns={columns} 
                tableContainerRef={tableContainerRef}
                hotRef={hotRef}
              />,
    'Insert': <InsertMenu addRow={addRow} addColumn={addColumn} />,
    'Data': <DataMenu
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
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          onDataLoaded(results.data, file.name);
        }
      });
    }
  };

  return (
    <div className={styles.menuBarContainer}>
      <div className={styles.menuBar}>
        {Object.keys(menuOptions).map((menu, index) => (
          <div
            key={index}
            className={`${styles.menuItem} ${activeMenu === menu ? styles.activeMenuItem : ''}`}
            onClick={() => handleMenuClick(menu)}
          >
            <button className={styles.button}>
              {menu}
            </button>
          </div>
        ))}
        <div className={styles.saveButton} onClick={onSaveCurrent}>
          <button className={styles.button}>
            Save Current Version
          </button>
        </div>
      </div>
      {activeMenu && (
        <div className={styles.secondaryMenuBar}>
          {menuOptions[activeMenu]}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".csv"
      />
    </div>
  );
};

export default MenuBar;
