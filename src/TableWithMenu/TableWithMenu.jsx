import React, { useState } from "react";
import { HotTable } from "@handsontable/react";
import MenuBar from "./MenuBar/MenuBar";
import Chart from "./Chart";
import {
  handleSelectionEnd,
  addRow,
  addColumn,
  removeColumn,
} from "../utils/rowColumnHandlers";
import { handleSort, handleFilter } from "../utils/filterSortHandlers";
import { countAndRemoveDuplicates } from "../utils/duplicateHandlers";
import { handleFindReplace } from "../utils/findReplaceHandlers";
import { handleUndo, handleRedo } from "../utils/undoRedoHandlers";
import { handleStyleChange, customRenderer } from "../utils/styleHandlers";
import "../App.css";

const TableWithMenu = ({
  data,
  setData,
  columnConfigs,
  setColumnConfigs,
  selectedColumnIndex,
  setSelectedColumnIndex,
  textStyles,
  setTextStyles,
  filteredColumns,
  setFilteredColumns,
  hotRef,
  selectedCellsRef,
  tableContainerRef,
  fileInputRef,
  saveDataToHistory,
  handleDataLoaded,
  originalFileName,
  setOriginalFileName,
  currentDataId,
  setCurrentDataId,
  setUploadHistory,
  historyIdCounter,
  setHistoryIdCounter,
  actions,
  setActions,
  setInitialActionStack,
  setInitialActionStackLength,
  showConfirmation,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  initialActionStack,
  initialActionStackLength,
  initializeColumns,
  handleStyleChange,
  toggleHistory,
  setSelectedRange,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([{ id: 0, content: "table" }]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [selectedRange, setSelectedRangeState] = useState(null);
  const [chartNotes, setChartNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);

  const selectedColumnName =
    selectedColumnIndex !== null
      ? columnConfigs[selectedColumnIndex]?.title
      : "";

  const setSeriesLabels = (chartIndex, newLabels) => {
    const newChartConfigs = [...chartConfigs];
    newChartConfigs[chartIndex] = {
      ...newChartConfigs[chartIndex],
      seriesLabels: newLabels,
    };
    setChartConfigs(newChartConfigs);
  };

  const setPieLabels = (chartIndex, newLabels) => {
    const newChartConfigs = [...chartConfigs];
    newChartConfigs[chartIndex] = {
      ...newChartConfigs[chartIndex],
      pieLabels: newLabels,
    };
    setChartConfigs(newChartConfigs);
  };

  const aggregateData = (data, aggregate, aggregateFunction) => {
    if (!aggregate) return data;

    const aggregatedData = {
      x: [],
      y: Array(data.y.length)
        .fill(null)
        .map(() => []),
    };

    const groupedData = {};
    data.x.forEach((xValue, index) => {
      if (!groupedData[xValue]) {
        groupedData[xValue] = Array(data.y.length)
          .fill(null)
          .map(() => []);
      }
      data.y.forEach((series, seriesIndex) => {
        groupedData[xValue][seriesIndex].push(Number(series[index]));
      });
    });

    console.log("Grouped Data:", JSON.stringify(groupedData, null, 2));

    Object.keys(groupedData).forEach((xValue) => {
      aggregatedData.x.push(parseFloat(xValue));
      groupedData[xValue].forEach((yValues, seriesIndex) => {
        let aggregatedYValue;
        console.log(
          `Aggregating for x=${xValue}, seriesIndex=${seriesIndex}, yValues=${yValues}`
        );
        switch (aggregateFunction) {
          case "SUM":
            aggregatedYValue = yValues.reduce((acc, curr) => acc + curr, 0);
            break;
          case "AVERAGE":
            aggregatedYValue =
              yValues.reduce((acc, curr) => acc + curr, 0) / yValues.length;
            break;
          case "COUNT":
            aggregatedYValue = yValues.length;
            break;
          case "MAX":
            aggregatedYValue = Math.max(...yValues);
            break;
          case "MIN":
            aggregatedYValue = Math.min(...yValues);
            break;
          default:
            aggregatedYValue = yValues[0];
            break;
        }
        aggregatedData.y[seriesIndex].push(aggregatedYValue);
      });
    });

    console.log("Aggregated Data:", JSON.stringify(aggregatedData, null, 2));
    return aggregatedData;
  };
  const renderPageContent = () => {
    const currentPageContent = pages.find(
      (page) => page.id === currentPage
    )?.content;
    if (currentPageContent === "table") {
      return (
        <div className="handsontable-container" ref={tableContainerRef}>
          <div className="hot-table-wrapper">
            <HotTable
              ref={hotRef}
              data={data}
              colHeaders
              columns={columnConfigs.map((col) => ({
                ...col,
                renderer: (
                  instance,
                  td,
                  row,
                  col,
                  prop,
                  value,
                  cellProperties
                ) =>
                  customRenderer(
                    instance,
                    td,
                    row,
                    col,
                    prop,
                    value,
                    cellProperties,
                    textStyles
                  ),
                columnSorting: { headerAction: false },
              }))}
              rowHeaders
              width="100%"
              height="100%"
              autoWrapRow
              autoWrapCol
              columnSorting
              filters
              manualColumnResize
              autoColumnSize
              afterSelectionEnd={(r1, c1, r2, c2) =>
                handleSelectionEnd(
                  r1,
                  c1,
                  r2,
                  c2,
                  selectedCellsRef,
                  setSelectedColumnIndex,
                  setSelectedRangeState,
                  hotRef
                )
              }
              selectionMode="range"
              afterGetColHeader={(col, TH) => {
                const headerLevel =
                  -1 * TH.parentNode.parentNode.childNodes.length +
                  Array.prototype.indexOf.call(
                    TH.parentNode.parentNode.childNodes,
                    TH.parentNode
                  );
                if (headerLevel === -1 && filteredColumns[col]) {
                  TH.classList.add("green-header");
                }
              }}
              outsideClickDeselects={false}
              fillHandle
              comments
              licenseKey="non-commercial-and-evaluation"
              undoRedo
              settings={{ textStyles }}
            />
          </div>
        </div>
      );
    } else if (currentPageContent.startsWith("chart")) {
      const chartIndex = parseInt(currentPageContent.split("-")[1], 10);
      const {
        type,
        data,
        aggregate,
        aggregateFunction,
        seriesLabels,
        pieLabels,
      } = chartConfigs[chartIndex];
      return (
        <Chart
          type={type}
          data={data}
          index={chartIndex}
          aggregate={aggregate}
          aggregateFunction={aggregateFunction}
          chartNotes={chartNotes}
          setChartNotes={setChartNotes}
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          seriesLabels={seriesLabels}
          setSeriesLabels={setSeriesLabels}
          pieLabels={pieLabels}
          setPieLabels={setPieLabels}
          aggregateData={aggregateData}
        />
      );
    }
  };

  const addChartPage = (
    type,
    data,
    aggregate,
    aggregateFunction,
    seriesLabels
  ) => {
    const newPageId = pages.length;
    setPages([
      ...pages,
      { id: newPageId, content: `chart-${chartConfigs.length}` },
    ]);
    setChartConfigs([
      ...chartConfigs,
      {
        type,
        data,
        aggregate,
        aggregateFunction,
        seriesLabels: type !== "pie" ? seriesLabels : [],
        pieLabels: type === "pie" ? data.x : [],
      },
    ]);
    setChartNotes({
      ...chartNotes,
      [chartConfigs.length]: "Title",
    });
    setCurrentPage(newPageId);
  };

  return (
    <div className="table-content-area">
      <div className="rectangle"></div>
      <div className="menu-bar-container">
        <MenuBar
          onSaveCurrent={() => {
            saveDataToHistory(
              data,
              originalFileName,
              currentDataId,
              setUploadHistory,
              setCurrentDataId,
              historyIdCounter,
              setHistoryIdCounter,
              actions,
              originalFileName,
              textStyles,
              initialActionStackLength,
              hotRef
            );
            setInitialActionStack([
              ...hotRef.current.hotInstance.undoRedo.doneActions,
            ]);
            setInitialActionStackLength(
              hotRef.current.hotInstance.undoRedo.doneActions.length
            );
          }}
          onDataLoaded={(newData, fileName) => {
            handleDataLoaded(
              newData,
              fileName,
              setData,
              setColumnConfigs,
              setOriginalFileName,
              setCurrentDataId,
              saveDataToHistory,
              historyIdCounter,
              setHistoryIdCounter,
              setUploadHistory,
              setActions,
              originalFileName,
              setTextStyles,
              setFilteredColumns,
              hotRef,
              setInitialActionStack,
              setInitialActionStackLength
            );
            setInitialActionStack([
              ...hotRef.current.hotInstance.undoRedo.doneActions,
            ]);
            setInitialActionStackLength(
              hotRef.current.hotInstance.undoRedo.doneActions.length
            );
          }}
          toggleHistory={toggleHistory}
          onStyleChange={(styleType, value) =>
            handleStyleChange(
              styleType,
              value,
              selectedCellsRef,
              setTextStyles,
              hotRef
            )
          }
          selectedColumnIndex={selectedColumnIndex}
          selectedColumnName={selectedColumnName}
          setColumns={setColumnConfigs}
          columns={columnConfigs}
          handleSort={(columnName, sortOrder) =>
            handleSort(columnName, sortOrder, columnConfigs, hotRef)
          }
          handleFilter={(columnIndex, condition, value, checkedValues) =>
            handleFilter(
              columnIndex,
              condition,
              value,
              hotRef,
              checkedValues,
              filteredColumns,
              setFilteredColumns
            )
          }
          tableContainerRef={tableContainerRef}
          countAndRemoveDuplicates={(remove) =>
            countAndRemoveDuplicates(data, setData, hotRef, remove)
          }
          addRow={() => addRow(data, setData, columnConfigs, hotRef)}
          addColumn={() =>
            addColumn(data, setData, columnConfigs, setColumnConfigs, hotRef)
          }
          handleFindReplace={(findText, replaceText) =>
            handleFindReplace(
              findText,
              replaceText,
              selectedColumnIndex,
              selectedColumnName,
              data,
              setData,
              hotRef
            )
          }
          handleUndo={() => handleUndo(hotRef)}
          handleRedo={() => handleRedo(hotRef)}
          hotRef={hotRef}
          filteredColumns={filteredColumns}
          setFilteredColumns={setFilteredColumns}
          fileInputRef={fileInputRef}
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          setConfirmationMessage={setConfirmationMessage}
          setOnConfirmAction={setOnConfirmAction}
          setOnCancelAction={setOnCancelAction}
          initialActionStack={initialActionStack}
          initialActionStackLength={initialActionStackLength}
          setInitialActionStack={setInitialActionStack}
          setInitialActionStackLength={setInitialActionStackLength}
          addChartPage={addChartPage}
          selectedRange={selectedRange}
          aggregateData={aggregateData}
        />
      </div>
      {renderPageContent()}
      <div className="page-footer">
        {pages.map((page, index) => (
          <button
            key={page.id}
            className="nav-button"
            onClick={() => setCurrentPage(page.id)}
            disabled={currentPage === page.id}
          >
            {page.content === "table"
              ? "Table"
              : page.content.startsWith("chart")
              ? `Chart ${page.content.split("-")[1]}`
              : `Empty Page ${index}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableWithMenu;
