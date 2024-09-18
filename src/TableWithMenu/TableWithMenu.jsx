import React, { useState, useEffect } from "react";
import { HotTable } from "@handsontable/react";
import MenuBar from "./MenuBar/MenuBar";
import Chart from "./Chart";
import "handsontable/dist/handsontable.full.min.css";
import scatterIcon from "../assets/scatter.svg";
import {
  handleSelectionEnd,
  addRow,
  addColumn,
  removeColumn,
} from "../utils/rowColumnHandlers";
import { handleSort, handleFilter } from "../utils/filterSortHandlers";
import { countAndRemoveDuplicates } from "../utils/duplicateHandlers";
import { handleFindReplace } from "../utils/findReplaceHandlers";
import { handleStyleChange, customRenderer } from "../utils/styleHandlers";
import "../styles/App.css";
import { originalColors, tintedColors } from "./Chart";

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
  chartNames,
  setChartNames,
  chartConfigs,
  setChartConfigs,
  idList,
  setIdList,
  pages,
  setPages,
  footerNames,
  setFooterNames,
  currentPage,
  setCurrentPage,
  handleExport,
}) => {
  const [selectedRange, setSelectedRangeState] = useState(null);
  const [chartNotes, setChartNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);

  const selectedColumnName =
    selectedColumnIndex !== null
      ? columnConfigs[selectedColumnIndex]?.title
      : "";

  const updateChartConfigs = (index, updates) => {
    setChartConfigs((prevConfigs) =>
      prevConfigs.map((config, idx) =>
        idx === index ? { ...config, ...updates } : config
      )
    );
  };

  const setSeriesLabels = (chartIndex, newLabels) =>
    updateChartConfigs(chartIndex, { seriesLabels: newLabels });
  const setPieLabels = (chartIndex, newLabels) =>
    updateChartConfigs(chartIndex, { pieLabels: newLabels });
  const setColors = (chartIndex, newColors) =>
    updateChartConfigs(chartIndex, { colors: newColors });
  const updateChartTitle = (chartIndex, newTitle) =>
    updateChartConfigs(chartIndex, { title: newTitle });
  const updateXAxisTitle = (chartIndex, newTitle) =>
    updateChartConfigs(chartIndex, { xAxisTitle: newTitle });
  const updateYAxisTitle = (chartIndex, newTitle) =>
    updateChartConfigs(chartIndex, { yAxisTitle: newTitle });

  const getIconForFooter = (index) => {
    if (index === 0) {
      return <i className="bi bi-table" style={{ marginRight: "5px" }}></i>;
    }

    const chartConfig = chartConfigs[index - 1]; // Offset by 1 because the first is "Table"
    switch (chartConfig.type) {
      case "pie":
        return (
          <i className="bi bi-pie-chart" style={{ marginRight: "5px" }}></i>
        );
      case "line":
        return (
          <i className="bi bi-graph-up" style={{ marginRight: "5px" }}></i>
        );
      case "bar":
        return (
          <i
            className="bi bi-bar-chart-line"
            style={{ marginRight: "5px" }}
          ></i>
        );
      case "scatter":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="scatter-icon"
            style={{ marginRight: "5px" }}
          >
            <path fill="currentColor" d="M1 15V0H0v16h16v-1H1z"></path>
            <path
              fill="currentColor"
              d="M5 11a1 1 0 11-2 0 1 1 0 012 0zM8 6a1 1 0 11-2 0 1 1 0 012 0zM14 5a1 1 0 11-2 0 1 1 0 012 0zM11 10a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const aggregateData = (data, aggregate, aggregateFunction) => {
    if (!aggregate) return data;
    if (!data || !data.x || !Array.isArray(data.x) || data.x.length === 0) {
      return { x: [], y: [[]] };
    }

    const aggregatedData = {
      x: [],
      y: [[]], // Ensure y is initialized as an array of arrays
    };

    if (aggregateFunction === "COUNT") {
      const counts = {};

      data.x.forEach((xValue) => {
        counts[xValue] = (counts[xValue] || 0) + 1;
      });

      aggregatedData.x = Object.keys(counts);
      aggregatedData.y = [Object.values(counts)];
    } else {
      const groupedData = {};

      data.x.forEach((xValue, index) => {
        if (!groupedData[xValue]) {
          groupedData[xValue] = Array(data.y.length)
            .fill(null)
            .map(() => []);
        }

        data.y.forEach((series, seriesIndex) => {
          const value = Number(series[index]);
          if (!isNaN(value)) {
            // Ensure the y array for this series exists and is initialized as an array
            if (!aggregatedData.y[seriesIndex]) {
              aggregatedData.y[seriesIndex] = [];
            }
            groupedData[xValue][seriesIndex].push(value);
          }
        });
      });

      Object.keys(groupedData).forEach((xValue) => {
        aggregatedData.x.push(xValue);
        groupedData[xValue].forEach((yValues, seriesIndex) => {
          const aggregateFunctions = {
            SUM: (values) => values.reduce((acc, curr) => acc + curr, 0),
            AVERAGE: (values) =>
              values.reduce((acc, curr) => acc + curr, 0) / values.length,
            MAX: (values) => Math.max(...values),
            MIN: (values) => Math.min(...values),
          };

          // Ensure the y array for this series exists before pushing values
          if (!aggregatedData.y[seriesIndex]) {
            aggregatedData.y[seriesIndex] = [];
          }

          aggregatedData.y[seriesIndex].push(
            yValues.length > 0
              ? aggregateFunctions[aggregateFunction](yValues)
              : null
          );
        });
      });
    }

    if (
      aggregatedData.x.length === 0 ||
      aggregatedData.y.some((y) => y.length === 0)
    ) {
      console.error(
        "Aggregated data resulted in an empty dataset",
        aggregatedData
      );
      return { x: [], y: [[]] };
    }

    return aggregatedData;
  };

  const renderPageContent = () => {
    const currentPageContent = pages.find(
      (page) => page.id === currentPage
    )?.content;

    if (currentPageContent.startsWith("chart")) {
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

      return (
        <div className="chart-overlay">
          <Chart
            type={type}
            data={data} // Already aggregated data
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
            setColors={setColors}
            updateChartTitle={updateChartTitle}
            updateFooterName={updateFooterName}
            title={title}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            updateXAxisTitle={updateXAxisTitle}
            updateYAxisTitle={updateYAxisTitle}
            onDeleteChart={() => handleDeleteChart(chartIndex)}
          />
        </div>
      );
    }
    return null;
  };

  const addChartPage = (
    type,
    data,
    aggregate,
    aggregateFunction,
    seriesLabels,
    isXNumeric
  ) => {
    let aggregatedData = data;

    if (aggregate && aggregateFunction !== "COUNT") {
      aggregatedData = aggregateData(data, aggregate, aggregateFunction);
    }

    // For COUNT, set the label to the column name of the selected x-axis
    if (aggregateFunction === "COUNT" && aggregate) {
      const xColumnName = seriesLabels[0]; // Use the first selected label (which corresponds to x-axis column)
      seriesLabels = [xColumnName ? `Count of ${xColumnName}` : "Count"];
    }

    const numColors =
      type === "pie" ? aggregatedData.x.length : aggregatedData.y.length;
    const shuffledColors = shuffleArray([...allColors]);
    const generatedColors = shuffledColors.slice(0, numColors);

    const newPageId = pages.length;
    const newChartId = chartConfigs.length;
    const newTitle = `Chart ${newChartId}`;

    const newPages = [
      ...pages,
      { id: newPageId, content: `chart-${newChartId}`, title: newTitle },
    ];
    const newChartConfigs = [
      ...chartConfigs,
      {
        type,
        data: aggregatedData,
        aggregate,
        aggregateFunction,
        seriesLabels: type !== "pie" ? seriesLabels : [],
        pieLabels: type === "pie" ? aggregatedData.x : [],
        colors: generatedColors,
        title: newTitle,
        xAxisTitle: "x-axis",
        yAxisTitle: "y-axis",
        isXNumeric, // Store whether the x-axis data is numeric
      },
    ];

    setPages(newPages);
    setChartConfigs(newChartConfigs);
    setChartNotes({ ...chartNotes, [newChartId]: "Title" });
    setFooterNames([...footerNames, `Chart ${newChartId}`]);
    setCurrentPage(newPageId);
    setChartNames([...footerNames, `Chart ${newChartId}`]);
  };

  const handleDeleteChart = (chartIndex) => {
    setPages((prevPages) =>
      prevPages.filter((page) => page.id !== chartIndex + 1)
    );
    setChartConfigs((prevConfigs) =>
      prevConfigs.filter((_, index) => index !== chartIndex)
    );
    setFooterNames((prevFooterNames) =>
      prevFooterNames.filter((_, index) => index !== chartIndex + 1)
    );
    setChartNames((prevChartNames) =>
      prevChartNames.filter((_, index) => index !== chartIndex + 1)
    );
    setChartNotes((prevChartNotes) => {
      const { [chartIndex]: _, ...remainingNotes } = prevChartNotes;
      return remainingNotes;
    });

    // Update currentPage to the first page (table) if the deleted chart was the current page
    if (currentPage === chartIndex + 1) {
      setCurrentPage(0);
    }
  };

  const updateFooterName = (index, newName) => {
    setFooterNames((prevFooterNames) =>
      prevFooterNames.map((name, i) => (i === index + 1 ? newName : name))
    );
    setChartNames((prevFooterNames) =>
      prevFooterNames.map((name, i) => (i === index + 1 ? newName : name))
    );
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
              idList,
              setIdList,
              actions,
              originalFileName,
              textStyles,
              initialActionStackLength,
              hotRef,
              chartConfigs,
              footerNames
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
              idList,
              setIdList,
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
          handleExport={handleExport}
        />
      </div>
      <div
        className="handsontable-container container-fluid"
        ref={tableContainerRef}
      >
        <div className="hot-table-wrapper">
          <HotTable
            ref={hotRef}
            data={data}
            colHeaders
            columns={columnConfigs.map((col) => ({
              ...col,
              renderer: (instance, td, row, col, prop, value, cellProperties) =>
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
              if (headerLevel === -1 && filteredColumns[col])
                TH.classList.add("green-header");
            }}
            beforeColumnResize={(newSize, column, isDoubleClick) => {
              if (newSize > 300) {
                return 300;
              }
            }}
            outsideClickDeselects={false}
            fillHandle
            comments
            licenseKey="non-commercial-and-evaluation"
            undoRedo
            settings={{ textStyles }}
            autoColumnSize={{ syncLimit: 300 }}
            modifyColWidth={(width, col) => {
              if (width > 300) {
                return 300;
              }
              return width;
            }}
          />
        </div>
      </div>
      {renderPageContent()}
      <div className="page-footer btn-group" role="group">
        {footerNames.map((name, index) => (
          <button
            key={index}
            className={`nav-button btn btn-outline-primary ${
              currentPage === index ? "active" : ""
            }`}
            onClick={() => setCurrentPage(index)}
            disabled={currentPage === index}
            style={{ width: "auto" }}
          >
            {getIconForFooter(index)} {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableWithMenu;
