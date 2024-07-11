import React from 'react';
import MainSidebar from './MainSidebar';
import StoryMenu from './StoryMenu';

const SidebarWithStoryMenu = ({
  data,
  columnConfigs,
  selectedColumnIndex,
  selectedColumnName,
  handleFilter,
  hotRef,
  filteredColumns,
  setFilteredColumns,
  selectedRange,
  tableContainerRef,
  setShowConfirmation,
  setConfirmationMessage
}) => {
  return (
    <div className="sidebar-content-area">
      <div className="main-sidebar-container">
        <div className="menu-bar-container">
          <StoryMenu 
            columnConfigs={columnConfigs}
            selectedRange={selectedRange}
            tableContainerRef={tableContainerRef}
            hotRef={hotRef}
            setShowConfirmation={setShowConfirmation}
            setConfirmationMessage={setConfirmationMessage}
          />
        </div>
        <MainSidebar
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
    </div>
  );
};

export default SidebarWithStoryMenu;
