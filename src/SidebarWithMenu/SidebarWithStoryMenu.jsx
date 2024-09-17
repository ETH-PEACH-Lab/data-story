import React, { useState } from "react";
import TutorialMenu from "./Tutorial/TutorialMenu";
import Story from "./Story";

// Initial components for the Story component
const initialStoryComponents = [
  {
    type: "text",
    text: `<h1 style="color:darkgreen; text-decoration:underline; font-weight:bold;">Data-Story</h1>`,
    fontSize: "32px",
  },
  {
    type: "text",
    text: `<p>Please document your thought process here:</p>`,
    fontSize: "16px",
  },
];

// Initial tutorial components
const initialTutorialComponents = [
  {
    type: "text",
    text: `<h1 style="color:darkred; text-decoration:underline; font-weight:bold;">Data Story - Introduction</h1><p>Welcome to my study!</p><p>In this section, you will be using my tool designed to help you analyze data and create narratives.</p><p>These instructions will guide you through the different functionalities of this application and later you can use them to analyze the data set on your own and construct your own narrative around it.</p><p><b><u>Feel free to ask any questions you might come across.</u></b></p>`,
    fontSize: "16px",
  },
  {
    type: "text",
    text: `<h2 style="color:darkred; text-decoration:underline;">Story Tools</h2><p>First we will cover the story tools that are available and how to use them.</p><p>You can click the + button at the bottom of this page to add another story element.</p><p>Story elements can be moved around or deleted through the three dots on the side of each element.</p><p><b><u>Text</u></b></p><p>Any text box is editable by simply clicking on it.</p><p><b><u>Functions</u></b></p><p>You can select any range of cells in your main table on the left side. The function you select will then be applied to your selected data and the result is displayed. Note that some functions cannot be applied to text.</p><p><b><u>Tables</u></b></p><p>When adding a table, you can select which columns will be displayed. You can also add two highlighters to your table. You can select onto which rows and columns this highlighter is applied to and what condition the cell needs to fulfill to be highlighted.</p><p><b><u>Charts</u></b></p><p>Once you have made a chart through the 'Chart' button in the 'Insert' menu on the left, you can select it to add it to your story. Note that a chart cannot be edited when added to your story, so make sure that anything you want to change (title, colors, ...) should be done before adding the chart to your story.</p>`,
    fontSize: "16px",
  },
  {
    type: "text",
    text: `<p>Feel free to try out some things here, or continue directly with the study.</p>`,
    fontSize: "16px",
  },
];

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
  setOnConfirmAction,
  setOnCancelAction,
  chartNames,
  chartConfigs,
  components, // Main Story components
  setComponents, // Set Main Story components
}) => {
  const [activeMenu, setActiveMenu] = useState("");

  [components, setComponents] = useState(initialStoryComponents);

  const [tutorialComponents, setTutorialComponents] = useState(
    initialTutorialComponents
  );

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? "" : menu);
  };

  const menuOptions = {
    Tutorial: (
      <div className="shift-right">
        {/* Separate Story for Tutorial with independent state */}
        <Story
          components={tutorialComponents}
          setComponents={setTutorialComponents}
          data={data}
          columnConfigs={columnConfigs}
          chartNames={chartNames}
          chartConfigs={chartConfigs}
          setShowConfirmation={setShowConfirmation}
          setConfirmationMessage={setConfirmationMessage}
          setOnConfirmAction={setOnConfirmAction}
          setOnCancelAction={setOnCancelAction}
          selectedRange={selectedRange}
          tableContainerRef={tableContainerRef}
          hotRef={hotRef}
        />
      </div>
    ),
  };

  return (
    <div className="sidebar-content-area">
      <div className="main-sidebar-container">
        <div className="text-and-menu-container">
          <div className="sidebar" style={{ paddingRight: "15px" }}>
            {/* Render the appropriate menu or the main Story component */}
            {activeMenu ? (
              menuOptions[activeMenu]
            ) : (
              // Main Story with its own components state
              <Story
                components={components}
                setComponents={setComponents}
                data={data}
                columnConfigs={columnConfigs}
                chartNames={chartNames}
                chartConfigs={chartConfigs}
                setShowConfirmation={setShowConfirmation}
                setConfirmationMessage={setConfirmationMessage}
                setOnConfirmAction={setOnConfirmAction}
                setOnCancelAction={setOnCancelAction}
                selectedRange={selectedRange}
                tableContainerRef={tableContainerRef}
                hotRef={hotRef}
              />
            )}
          </div>

          {/* Tutorial menu with independent Story component */}
          <TutorialMenu
            buttons={["Tutorial"]}
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarWithStoryMenu;
