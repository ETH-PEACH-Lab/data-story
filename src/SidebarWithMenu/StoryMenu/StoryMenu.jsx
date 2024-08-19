import React, { useState } from "react";
import ChartMenu from "./ChartMenu";
import TextMenu from "./TextMenu";
import TableMenu from "./TableMenu";
import FunctionMenu from "./FunctionMenu";

const StoryMenu = ({
  selectedOption,
  handleAddComponent,
  columnConfigs,
  tableContainerRef,
  hotRef,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  chartNames,
  chartConfigs,
  selectedRangeState,
}) => {
  const [selectedColumns, setSelectedColumns] = useState(
    columnConfigs.map((col) => col.title)
  );

  let renderedMenu;
  switch (selectedOption) {
    case "chart":
      renderedMenu = (
        <ChartMenu
          addComponent={handleAddComponent}
          chartNames={chartNames}
          chartConfigs={chartConfigs}
        />
      );
      break;
    case "text":
      renderedMenu = <TextMenu addComponent={handleAddComponent} />;
      break;
    case "table":
      renderedMenu = (
        <TableMenu
          columnConfigs={columnConfigs}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          addComponent={handleAddComponent}
        />
      );
      break;
    case "function":
      renderedMenu = (
        <FunctionMenu
          selectedRangeState={selectedRangeState}
          getSelectedCellsData={() =>
            hotRef.current?.hotInstance.getData(
              selectedRangeState?.minRow,
              selectedRangeState?.minCol,
              selectedRangeState?.maxRow,
              selectedRangeState?.maxCol
            )
          }
          setSelectedFunction={() => {}}
          selectedFunction={""}
          setShowConfirmation={setShowConfirmation}
          setConfirmationMessage={setConfirmationMessage}
          setOnConfirmAction={setOnConfirmAction}
          setOnCancelAction={setOnCancelAction}
          addComponent={handleAddComponent}
        />
      );
      break;
    default:
      renderedMenu = null;
  }

  return <div>{renderedMenu}</div>;
};

export default StoryMenu;
