import React, { useCallback, useState } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import { textRenderer } from "handsontable/renderers/textRenderer";
import EditMenu from "./EditMenu";

const StoryTable = ({
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMenuVisible,
  setVisibleMenuIndex,
  data,
  columnConfigs,
  selectedColumns = [],
  highlightSettings = [], // Add default value
  highlightColors = [], // Add default value
}) => {
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const toggleFirstTableExpand = () => {
    setIsTableExpanded(!isTableExpanded);
  };

  const checkCondition = (condition, value, targetValue) => {
    switch (condition) {
      case "no condition":
        return true; // Always return true for 'any value' to select all cells
      case "empty":
        return value === null || value === undefined || value === "";
      case "not empty":
        return value !== null && value !== undefined && value !== "";
      case "is equal":
        return value == targetValue; // Loose equality for type conversion
      case "is not equal":
        return value != targetValue; // Loose inequality for type conversion
      case "is bigger than":
        return parseFloat(value) > parseFloat(targetValue);
      case "is less than":
        return parseFloat(value) < parseFloat(targetValue);
      case "is bigger than or equal":
        return parseFloat(value) >= parseFloat(targetValue);
      case "is less than or equal":
        return parseFloat(value) <= parseFloat(targetValue);
      case "begins with":
        return value != null && value.startsWith(targetValue);
      case "ends with":
        return value != null && value.endsWith(targetValue);
      case "contains":
        return value != null && value.includes(targetValue);
      case "does not contain":
        return value != null && !value.includes(targetValue);
      default:
        return false;
    }
  };

  const selectColumnRenderer = useCallback(
    (instance, td, row, col, prop, value, cellProperties) => {
      textRenderer.apply(this, [
        instance,
        td,
        row,
        col,
        prop,
        value,
        cellProperties,
      ]);

      const applyHighlight = (setting, highlightColor) => {
        const columnConfig = columnConfigs[col];
        const rowInRange =
          setting.rowSelection === "of all rows" ||
          (setting.rowSelection === "of range of rows" &&
            row >= parseInt(setting.rowRange.split("-")[0]) - 1 &&
            row <= parseInt(setting.rowRange.split("-")[1]) - 1);
        const columnSelected =
          setting.columnSelection === "of all columns" ||
          setting.selectedColumns.length === 0 || // Treat no selection as all columns
          setting.selectedColumns.includes(columnConfig.title);

        const conditionMet = checkCondition(
          setting.condition,
          value,
          setting.value
        );

        if (rowInRange && columnSelected && conditionMet) {
          td.style.backgroundColor = highlightColor;
        }
      };

      // Apply Highlight 1
      if (highlightSettings[0]?.isEnabled) {
        applyHighlight(highlightSettings[0], highlightColors[0]);
      }

      // Apply Highlight 2 on top of Highlight 1
      if (highlightSettings[1]?.isEnabled) {
        applyHighlight(highlightSettings[1], highlightColors[1]);
      }
    },
    [highlightSettings, highlightColors, columnConfigs]
  );

  // Define columnsConfig correctly
  const columnsConfig = columnConfigs.map((col) => ({
    data: col.data,
    renderer: selectColumnRenderer,
  }));

  // Get indexes of columns to hide
  const hiddenColumnsIndexes = columnConfigs
    .map((column, index) => {
      if (!selectedColumns.includes(column.title)) {
        return index;
      }
      return null;
    })
    .filter((index) => index !== null);

  return (
    <div className="table-container">
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          ⋮
        </button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
      )}
      <div className="table-wrapper">
        <div
          className="small-table-wrapper"
          style={{
            width: "100%",
            height: isTableExpanded ? 400 : 180,
            overflow: "auto",
          }}
        >
          <HotTable
            data={data} // Pass the entire dataset
            colHeaders={columnConfigs.map((column) => column.title)}
            columns={columnsConfig}
            rowHeaders={true}
            width="100%"
            height="100%"
            licenseKey="non-commercial-and-evaluation"
            readOnly={true}
            disableVisualSelection={true}
            manualColumnResize={true}
            hiddenColumns={{
              columns: hiddenColumnsIndexes,
              indicators: true,
              copyPasteEnabled: false,
            }}
            contextMenu={{
              items: {
                hidden_columns_show: {
                  name: "Show hidden columns",
                },
                hidden_columns_hide: {
                  name: "Hide column",
                },
                ...Handsontable.plugins.ContextMenu.DEFAULT_ITEMS,
              },
            }}
          />
        </div>
        <button className="expandButton" onClick={toggleFirstTableExpand}>
          {isTableExpanded ? "Collapse Table" : "Expand Table"}
        </button>
      </div>
    </div>
  );
};

export default StoryTable;
