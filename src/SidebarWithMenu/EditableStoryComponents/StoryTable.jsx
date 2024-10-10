import React, { useCallback, useState, useEffect, useRef } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import { textRenderer } from "handsontable/renderers/textRenderer";
import EditMenu from "./EditMenu";

const StoryTable = ({
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdate,
  isMenuVisible,
  setVisibleMenuIndex,
  shownData,
  columnConfigs,
  selectedColumns = [],
  highlightSettings = [], // Add default value
  highlightColors = [], // Add default value
}) => {
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [containerWidth, setContainerWidth] = useState("100%");
  const [containerHeight, setContainerHeight] = useState("180px"); // Default height when not expanded
  const tableRef = useRef(null);

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

  useEffect(() => {
    const hotInstance = tableRef.current?.hotInstance;

    const calculateDimensions = () => {
      if (hotInstance) {
        let totalWidth = 0;
        let totalHeight = 0;

        // Calculate total width
        for (let col = -1; col < hotInstance.countCols(); col++) {
          if (!hiddenColumnsIndexes.includes(col)) {
            totalWidth += hotInstance.getColWidth(col);
          }
        }

        // Calculate total height
        for (let row = -1; row < hotInstance.countRows(); row++) {
          totalHeight += hotInstance.getRowHeight(row) || 23; // Default row height is 23px if undefined
        }

        // Only update state if the new width/height is different from the current one
        const newContainerWidth = Math.max(
          totalWidth + 0,
          hotInstance.rootElement.clientWidth
        );
        const newContainerHeight = isTableExpanded
          ? Math.min(totalHeight + 4, 400)
          : Math.min(totalHeight + 4, 180);

        if (
          newContainerWidth !== containerWidth ||
          newContainerHeight !== containerHeight
        ) {
          // Batch state updates to avoid multiple re-renders
          setContainerWidth(newContainerWidth);
          setContainerHeight(newContainerHeight);
        }
      }
    };

    if (hotInstance) {
      calculateDimensions();
      hotInstance.addHook("afterRender", calculateDimensions);
    }

    // Cleanup the hook when component unmounts
    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterRender", calculateDimensions);
      }
    };
  }, [
    hiddenColumnsIndexes,
    columnConfigs,
    isTableExpanded,
    containerWidth,
    containerHeight,
  ]);

  return (
    <div className="table-container">
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onUpdate={onUpdate}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
      )}
      <div className="table-wrapper">
        <div
          className="small-table-wrapper"
          style={{
            height: containerHeight,
            overflow: "auto",
            width: containerWidth,
          }}
        >
          <HotTable
            ref={tableRef} // Reference to the Handsontable instance
            data={shownData} // Pass the entire dataset
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
        <button
          className="expandButton"
          onClick={toggleFirstTableExpand}
          style={{ width: "calc(100% - 8px)" }}
        >
          {isTableExpanded ? (
            <i className="bi bi-arrows-collapse"></i>
          ) : (
            <i className="bi bi-arrows-expand"></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoryTable;
