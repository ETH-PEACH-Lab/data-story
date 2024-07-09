import React, { useState, useCallback, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { textRenderer } from 'handsontable/renderers/textRenderer';
import FilterTutorial from './FilterTutorial';
import styles from './FilterComponent.module.css';
import TutorialMenu from './TutorialMenu';

function MainSidebar({
  data,
  columnConfigs,
  selectedColumnIndex,
  selectedColumnName,
  handleFilter,
  hotRef,
  filteredColumns,
  setFilteredColumns,
}) {
  const verticalMenuButtons = [
    { text: 'Option 1' },
    { text: 'Option 2' },
    { text: 'Option 3' },
  ];

  return (
    <div className="main-sidebar-container">
      <div className="sidebar" style={{ paddingRight: '15px' }}>
        <FilterTutorial
          data={data}
          columnConfigs={columnConfigs}
          selectedColumnIndex={selectedColumnIndex}
          selectedColumnName={selectedColumnName}
          handleFilter={handleFilter}
          hotRef={hotRef}
          filteredColumns={filteredColumns}
          setFilteredColumns={setFilteredColumns}
        />
      </div>
      <TutorialMenu buttons={verticalMenuButtons} />
    </div>
  );
}

export default MainSidebar;
