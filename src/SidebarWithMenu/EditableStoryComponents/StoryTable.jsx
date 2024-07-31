import "../Story.css";
import React, { useCallback, useState } from "react";
import { HotTable } from "@handsontable/react";
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
        <button className="expandButton" onClick={toggleFirstTableExpand}>
          {isTableExpanded ? "Collapse Table" : "Expand Table"}
        </button>
      </div>
    </div>
  );
};

export default StoryTable;
