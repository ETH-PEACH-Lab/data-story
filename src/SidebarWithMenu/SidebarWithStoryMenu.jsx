import React, { useState } from "react";
import FilterTutorial from "./FilterTutorial";
import TutorialMenu from "./TutorialMenu";
import Story from "./Story";
import StoryMenu from "./StoryMenu";

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
  setConfirmationMessage,
  chartNames,
  chartConfigs,
  components, // Use components from props
  setComponents, // Use setComponents from props
}) => {
  const [activeMenu, setActiveMenu] = useState("");

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? "" : menu);
  };

  const menuOptions = {
    Filtering: (
      <div className="shift-right">
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
    ),
    "Option 2": (
      <div className="shift-right">
        <h2>Option 2</h2>
        <p>This is the content for Option 2.</p>
      </div>
    ),
    "Option 3": (
      <div className="shift-right">
        <h2>Option 3</h2>
        <p>This is the content for Option 3.</p>
      </div>
    ),
  };

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
            chartNames={chartNames}
            chartConfigs={chartConfigs} // Pass chartConfigs as a prop
          />
        </div>
        <div className="text-and-menu-container">
          <div className="sidebar" style={{ paddingRight: "15px" }}>
            {activeMenu ? (
              menuOptions[activeMenu]
            ) : (
              <Story
                components={components} // Pass components from props
                setComponents={setComponents} // Pass setComponents from props
                data={data}
                columnConfigs={columnConfigs}
                chartConfigs={chartConfigs} // Pass chartConfigs as a prop
              />
            )}
          </div>
          <TutorialMenu
            buttons={["Filtering", "Option 2", "Option 3"]}
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarWithStoryMenu;
