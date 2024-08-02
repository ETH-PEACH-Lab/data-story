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
}) => {
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const toggleFirstTableExpand = () => {
    setIsTableExpanded(!isTableExpanded);
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
    },
    []
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

  console.log("selectedColumns in StoryTable:", selectedColumns);
  console.log("hiddenColumnsIndexes:", hiddenColumnsIndexes);
  console.log("columnsConfig:", columnsConfig);

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
