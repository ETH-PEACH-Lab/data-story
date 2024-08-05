import React, { useState, useEffect } from "react";
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

// Importing originalColors and tintedColors from Chart.jsx
import { originalColors, tintedColors } from "./Chart";

// Combine the original and tinted colors
const allColors = [...originalColors, ...tintedColors];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

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
  chartNames, // Accept chartNames as a prop
  setChartNames, // Accept setChartNames as a prop
  chartConfigs, // Accept chartConfigs as a prop
  setChartConfigs, // Accept setChartConfigs as a prop
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([
    { id: 0, content: "table", title: "Table" },
  ]);
  const [selectedRange, setSelectedRangeState] = useState(null);
  const [chartNotes, setChartNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [footerNames, setFooterNames] = useState(["Table"]); // Initialize with 'Table'

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

  const setColors = (chartIndex, newColors) => {
    const newChartConfigs = [...chartConfigs];
    newChartConfigs[chartIndex] = {
      ...newChartConfigs[chartIndex],
      colors: newColors,
    };
    setChartConfigs(newChartConfigs);
  };

  const updateChartTitle = (chartIndex, newTitle) => {
    setChartConfigs((prevConfigs) =>
      prevConfigs.map((config, index) =>
        index === chartIndex ? { ...config, title: newTitle } : config
      )
    );
  };

  const updateXAxisTitle = (chartIndex, newTitle) => {
    setChartConfigs((prevConfigs) =>
      prevConfigs.map((config, index) =>
        index === chartIndex ? { ...config, xAxisTitle: newTitle } : config
      )
    );
  };

  const updateYAxisTitle = (chartIndex, newTitle) => {
    setChartConfigs((prevConfigs) =>
      prevConfigs.map((config, index) =>
        index === chartIndex ? { ...config, yAxisTitle: newTitle } : config
      )
    );
  };

  const aggregateData = (data, aggregate, aggregateFunction) => {
    if (!aggregate) return data;

    if (!data || !data.y || !Array.isArray(data.y) || data.y.length === 0) {
      console.error("Invalid data structure in aggregateData", data);
      return { x: [], y: [[]] };
    }

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

    Object.keys(groupedData).forEach((xValue) => {
      aggregatedData.x.push(parseFloat(xValue));
      groupedData[xValue].forEach((yValues, seriesIndex) => {
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
        aggregatedData.y[seriesIndex].push(aggregatedYValue);
      });
    });

    console.log("Aggregated Data:", aggregatedData);

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
        colors,
        title,
        xAxisTitle,
        yAxisTitle,
      } = chartConfigs[chartIndex];

      // Log chart data before rendering
      console.log("Rendering chart with data:", {
        type,
        data,
        aggregate,
        aggregateFunction,
        seriesLabels,
        pieLabels,
        colors,
        title,
        xAxisTitle,
        yAxisTitle,
      });

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
          colors={colors}
          setColors={(chartIndex, newColors) =>
            setColors(chartIndex, newColors)
          }
          updateChartTitle={updateChartTitle} // Pass the update function
          updateFooterName={updateFooterName} // Pass the update function
          title={title} // Pass the title
          xAxisTitle={xAxisTitle} // Pass the xAxisTitle
          yAxisTitle={yAxisTitle} // Pass the yAxisTitle
          updateXAxisTitle={updateXAxisTitle} // Pass the update function
          updateYAxisTitle={updateYAxisTitle} // Pass the update function
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
    const numColors = type === "pie" ? data.x.length : data.y.length;

    // Shuffle the allColors array
    const shuffledColors = shuffleArray([...allColors]);

    // Get the first numColors from the shuffled array
    const generatedColors = shuffledColors.slice(0, numColors);

    const newPageId = pages.length;
    const newChartId = chartConfigs.length;
    const newTitle = `Chart ${newChartId}`;
    setPages([
      ...pages,
      {
        id: newPageId,
        content: `chart-${newChartId}`,
        title: newTitle,
      },
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
        colors: generatedColors,
        title: newTitle,
        xAxisTitle: "x-axis",
        yAxisTitle: "y-axis",
      },
    ]);
    setChartNotes({
      ...chartNotes,
      [newChartId]: "Title",
    });
    setFooterNames([...footerNames, `Chart ${newChartId}`]); // Add new chart name to footers
    setCurrentPage(newPageId);
    setChartNames([...footerNames, `Chart ${newChartId}`]); // Update chartNames
  };

  const updateFooterName = (index, newName) => {
    setFooterNames((prevFooterNames) =>
      prevFooterNames.map((name, i) => (i === index + 1 ? newName : name))
    );
    setChartNames((prevFooterNames) =>
      prevFooterNames.map((name, i) => (i === index + 1 ? newName : name))
    ); // Update chartNames
  };

  useEffect(() => {
    console.log("Updated Chart Names:", footerNames);
  }, [footerNames]);

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
        {footerNames.map((name, index) => (
          <button
            key={index}
            className="nav-button"
            onClick={() => setCurrentPage(index)}
            disabled={currentPage === index}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableWithMenu;
