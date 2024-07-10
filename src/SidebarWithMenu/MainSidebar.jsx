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
  const [textboxes, setTextboxes] = useState([
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit...'
  ]);

  const handleAddTextbox = () => {
    setTextboxes([...textboxes, 'New textbox content']);
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

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  return (
    <div className="main-sidebar-container">
      <div className="sidebar" style={{ paddingRight: '15px' }}>
        {activeMenu ? (
          menuOptions[activeMenu]
        ) : (
          <Story textboxes={textboxes} setTextboxes={setTextboxes} />  // Pass textboxes state to Story
        )}
      </div>
      <TutorialMenu buttons={['Filtering', 'Option 2', 'Option 3']} activeMenu={activeMenu} onMenuClick={handleMenuClick} />
    </div>
  );
}

export default MainSidebar;
