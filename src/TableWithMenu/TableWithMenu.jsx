import React, { useState } from "react";
import { HotTable } from "@handsontable/react";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MenuBar from "./MenuBar/MenuBar";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

  const selectedColumnName =
    selectedColumnIndex !== null
      ? columnConfigs[selectedColumnIndex]?.title
      : "";

  const renderChart = (type, data, index, aggregate, aggregateFunction) => {
    const aggregatedData = aggregateData(data, aggregate, aggregateFunction);

    const chartData = {
      labels: aggregatedData.x,
      datasets: aggregatedData.y.map((series, idx) => ({
        label: `Series ${idx + 1}`,
        data: series,
        fill: false,
        backgroundColor: `rgba(${idx * 60}, ${idx * 30}, ${idx * 90}, 0.6)`,
        borderColor: `rgba(${idx * 60}, ${idx * 30}, ${idx * 90}, 1)`,
      })),
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };

    const ChartComponent = {
      line: Line,
      bar: Bar,
      pie: Pie,
      scatter: Scatter,
    }[type];

    return ChartComponent ? (
      <div
        className="chart-container"
        style={{ height: "100%", width: "calc(100% - 85px)" }}
      >
        <ChartComponent key={index} data={chartData} options={chartOptions} />
      </div>
    ) : null;
  };

  const aggregateData = (data, aggregate, aggregateFunction) => {
    if (!aggregate) return data;

    const aggregatedData = {
      x: [],
      y: [],
    };
    const xValues = [...new Set(data.x)];
    xValues.forEach((xValue) => {
      const yValues = data.y.flatMap((series) =>
        series.filter((_, index) => data.x[index] === xValue)
      );

      let aggregatedYValue;
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

      aggregatedData.x.push(xValue);
      if (!aggregatedData.y[0]) aggregatedData.y[0] = [];
      aggregatedData.y[0].push(aggregatedYValue);
    });
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
      const { type, data, aggregate, aggregateFunction } =
        chartConfigs[chartIndex];
      return renderChart(type, data, currentPage, aggregate, aggregateFunction);
    }
  };

  const addPage = () => {
    const newPageId = pages.length;
    setPages([...pages, { id: newPageId, content: "empty" }]);
    setCurrentPage(newPageId);
  };

  const addChartPage = (type, data, aggregate, aggregateFunction) => {
    const newPageId = pages.length;
    setPages([
      ...pages,
      { id: newPageId, content: `chart-${chartConfigs.length}` },
    ]);
    setChartConfigs([
      ...chartConfigs,
      { type, data, aggregate, aggregateFunction },
    ]);
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
