import React from "react";
import "../Story.css";
import EditMenu from "./EditMenu";
import React, { useCallback, useState } from "react";
import { HotTable } from "@handsontable/react";
import { textRenderer } from "handsontable/renderers/textRenderer";

const StoryTable = ({
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMenuVisible,
  setVisibleMenuIndex,
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
      if (col === selectedColumnIndex) {
        td.style.backgroundColor = "lightsteelblue";
      }
    },
    [selectedColumnIndex]
  );

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
      <div className={styles.tableWrapper}>
        <div
          className="small-table-wrapper"
          style={{
            width: "100%",
            height: isTableExpanded ? 400 : 180,
            overflow: "auto",
          }}
        >
          <HotTable
            data={data}
            colHeaders={columnConfigs.map((column) => column.title)}
            columns={columnConfigs.map((col) => ({
              ...col,
              renderer: selectColumnRenderer,
            }))}
            rowHeaders={true}
            width="100%"
            height="100%"
            licenseKey="non-commercial-and-evaluation"
            readOnly={true}
            disableVisualSelection={true}
          />
        </div>
        <button
          className={styles.expandButton}
          onClick={toggleFirstTableExpand}
        >
          {isTableExpanded ? "Collapse Table" : "Expand Table"}
        </button>
      </div>
    </div>
  );
};

export default StoryTable;
