import React, { useState, useEffect } from "react";
import { HotTable } from "@handsontable/react";
import MenuBar from "./MenuBar/MenuBar";
import Chart from "./Chart";
import "handsontable/dist/handsontable.full.min.css";
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

  const aggregateData = (data, aggregate, aggregateFunction) => {
    if (!aggregate) return data;
    if (!data || !data.y || !Array.isArray(data.y) || data.y.length === 0) {
      console.error("Invalid data structure in aggregateData", data);
      return { x: [], y: [[]] };
    }

    if (isNaN(data.x[0])) {
      // Non-numeric x-axis, return data as is
      return data;
    }

    const aggregatedData = {
      x: [],
      y: Array(data.y.length)
        .fill(null)
        .map(() => []),
    };
    const groupedData = {};

    data.x.forEach((xValue, index) => {
      if (!groupedData[xValue])
        groupedData[xValue] = Array(data.y.length)
          .fill(null)
          .map(() => []);
      data.y.forEach((series, seriesIndex) =>
        groupedData[xValue][seriesIndex].push(Number(series[index]))
      );
    });

    Object.keys(groupedData).forEach((xValue) => {
      aggregatedData.x.push(xValue);
      groupedData[xValue].forEach((yValues, seriesIndex) => {
        const aggregateFunctions = {
          SUM: (values) => values.reduce((acc, curr) => acc + curr, 0),
          AVERAGE: (values) =>
            values.reduce((acc, curr) => acc + curr, 0) / values.length,
          COUNT: (values) => values.length,
          MAX: (values) => Math.max(...values),
          MIN: (values) => Math.min(...values),
        };
        aggregatedData.y[seriesIndex].push(
          aggregateFunctions[aggregateFunction](yValues)
        );
      });
    });

    return aggregatedData;
  };

  const renderPageContent = () => {
    const currentPageContent = pages.find(
      (page) => page.id === currentPage
    )?.content;
    if (currentPageContent === "table") {
      return (
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
    const shuffledColors = shuffleArray([...allColors]);
    const generatedColors = shuffledColors.slice(0, numColors);

    const newPageId = pages.length;
    const newChartId = chartConfigs.length;
    const newTitle = `Chart ${newChartId}`;
    setPages([
      ...pages,
      { id: newPageId, content: `chart-${newChartId}`, title: newTitle },
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
        />
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
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableWithMenu;
