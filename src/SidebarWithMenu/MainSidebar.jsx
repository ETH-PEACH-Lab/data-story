import React, { useState } from 'react';
import FilterTutorial from './FilterTutorial';
import TutorialMenu from './TutorialMenu';
import Story from './Story';

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
  const [activeMenu, setActiveMenu] = useState('');
  const [texts, setTexts] = useState(['Text']); // Initialize with 'Text'

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const menuOptions = {
    'Filtering': (
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
    ),
    'Option 2': (
      <div className="placeholder">
        <h2>Option 2</h2>
        <p>This is the content for Option 2.</p>
      </div>
    ),
    'Option 3': (
      <div className="placeholder">
        <h2>Option 3</h2>
        <p>This is the content for Option 3.</p>
      </div>
    ),
  };

  return (
    <div className="main-sidebar-container">
      <div className="text-and-menu-container">
        <div className="sidebar" style={{ paddingRight: '15px' }}>
          {activeMenu ? (
            menuOptions[activeMenu]
          ) : (
            <Story texts={texts} setTexts={setTexts} />
          )}
        </div>
        <TutorialMenu buttons={['Filtering', 'Option 2', 'Option 3']} activeMenu={activeMenu} onMenuClick={handleMenuClick} />
      </div>
    </div>
  );
}

export default MainSidebar;