import React, { useState, useRef, useEffect } from "react";
import styles from "./MenuBar.module.css";

const InsertMenu = ({
  addRow,
  addColumn,
  hotRef,
  addChartPage,
  selectedRange,
  aggregateData,
}) => {
  const [isChartDropdownVisible, setChartDropdownVisible] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState("");
  const [chartData, setChartData] = useState({ x: [], y: [] });
  const [isXAxisLocked, setXAxisLocked] = useState(false);
  const [isYAxisLocked, setYAxisLocked] = useState([]);
  const [lockedRange, setLockedRange] = useState({ x: null, y: [] });
  const [seriesCount, setSeriesCount] = useState(1);
  const [aggregate, setAggregate] = useState(false);
  const [selectedAggregateFunction, setSelectedAggregateFunction] =
    useState("AVERAGE");
  const [seriesLabels, setSeriesLabels] = useState([]);
  const chartDropdownRef = useRef(null);
  const chartButtonRef = useRef(null);

  const handleMenuClick = (item) => {
    switch (item) {
      case "Row":
        addRow();
        break;
      case "Column":
        addColumn();
        break;
      case "Chart":
        setChartDropdownVisible(!isChartDropdownVisible);
        break;
      default:
        break;
    }
  };

  const handleClickOutside = (event) => {
    if (
      chartDropdownRef.current &&
      !chartDropdownRef.current.contains(event.target) &&
      chartButtonRef.current &&
      !chartButtonRef.current.contains(event.target) &&
      !hotRef.current.hotInstance.rootElement.contains(event.target)
    ) {
      setChartDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedRange) {
      // Handle selected range if needed
    }
  }, [selectedRange]);

  const handleChartTypeChange = (event) => {
    setSelectedChartType(event.target.value);
    resetChartData();
  };

  const resetChartData = () => {
    setChartData({ x: [], y: [] });
    setXAxisLocked(false);
    setYAxisLocked([]);
    setLockedRange({ x: null, y: [] });
    setSeriesCount(1);
    setSeriesLabels([]);
  };

  const handleApplyChartData = (axis, index = 0) => {
    if (!selectedRange || isInvalidRange(selectedRange)) return;

    const hotInstance = hotRef.current.hotInstance;
    const selectedData = hotInstance
      .getData(
        selectedRange.minRow,
        selectedRange.minCol,
        selectedRange.maxRow,
        selectedRange.maxCol
      )
      .flat();

    // Always use the column header for the series label
    const header = hotInstance.getColHeader(selectedRange.minCol);

    if (axis === "x") {
      setChartData((prevState) => ({ ...prevState, x: selectedData }));
      setXAxisLocked(true);
      setLockedRange((prevState) => ({ ...prevState, x: selectedRange }));
    } else if (axis === "y") {
      setChartData((prevState) => {
        const newY = [...prevState.y];
        newY[index] = selectedData;
        return { ...prevState, y: newY };
      });
      setYAxisLocked((prevState) => {
        const newLocked = [...prevState];
        newLocked[index] = true;
        return newLocked;
      });
      setLockedRange((prevState) => {
        const newY = [...prevState.y];
        newY[index] = selectedRange;
        return { ...prevState, y: newY };
      });

      // Set the series label based on the header
      setSeriesLabels((prevLabels) => {
        const newLabels = [...prevLabels];
        newLabels[index] = header;
        return newLabels;
      });
    }
  };

  const handleResetChartData = (axis, index = 0) => {
    if (axis === "x") {
      setChartData((prevState) => ({ ...prevState, x: [] }));
      setXAxisLocked(false);
      setLockedRange((prevState) => ({ ...prevState, x: null }));
    } else if (axis === "y") {
      setChartData((prevState) => {
        const newY = [...prevState.y];
        newY[index] = [];
        return { ...prevState, y: newY };
      });
      setYAxisLocked((prevState) => {
        const newLocked = [...prevState];
        newLocked[index] = false;
        return newLocked;
      });
      setLockedRange((prevState) => {
        const newY = [...prevState.y];
        newY[index] = null;
        return { ...prevState, y: newY };
      });
      setSeriesLabels((prevLabels) => prevLabels.filter((_, i) => i !== index));
    }
  };

  const handleRemoveSeries = (index) => {
    setChartData((prevState) => ({
      ...prevState,
      y: prevState.y.filter((_, i) => i !== index),
    }));
    setYAxisLocked((prevState) => prevState.filter((_, i) => i !== index));
    setLockedRange((prevState) => ({
      ...prevState,
      y: prevState.y.filter((_, i) => i !== index),
    }));
    setSeriesCount((prevCount) => prevCount - 1);
    setSeriesLabels((prevLabels) => prevLabels.filter((_, i) => i !== index));
  };

  const generateRangeString = (range) => {
    if (!range) return "";
    const singleCol = range.maxCol === range.minCol;
    const singleRow = range.maxRow === range.minRow;

    if (range.allCols && singleRow) {
      return `Row: ${range.minRow + 1}`;
    } else if (range.allRows && singleCol) {
      return `Column: ${range.minCol + 1}`;
    } else if (range.allCols) {
      return `Column: ${range.minCol + 1}`;
    } else if (range.allRows) {
      return `Row: ${range.minRow + 1}`;
    } else {
      const rowWord = !singleRow ? "Rows" : "Row";
      const colWord = !singleCol ? "Columns" : "Column";
      const rowRange = !singleRow
        ? `${range.minRow + 1}-${range.maxRow + 1}`
        : `${range.minRow + 1}`;
      const colRange = !singleCol
        ? `${range.minCol + 1}-${range.maxCol + 1}`
        : `${range.minCol + 1}`;
      return `${rowWord}: ${rowRange}, ${colWord}: ${colRange}`;
    }
  };

  const isInvalidRange = (range) => {
    if (!range) return false;
    const rowCount = range.maxRow - range.minRow + 1;
    const colCount = range.maxCol - range.minCol + 1;
    return rowCount > 1 && colCount > 1;
  };

  const isAddChartDisabled =
    !isXAxisLocked || !isYAxisLocked.every((locked) => locked);

  const handleAddSeries = () => {
    setSeriesCount((prevCount) => prevCount + 1);
    setYAxisLocked((prevLocked) => [...prevLocked, false]);
    setLockedRange((prevRange) => ({
      ...prevRange,
      y: [...prevRange.y, null],
    }));
    // Default to an empty string, will be set upon data application
    setSeriesLabels((prevLabels) => [...prevLabels, ""]);
  };

  const handleAddChart = () => {
    if (!isAddChartDisabled) {
      let chartDataToUse = chartData;

      if (aggregate) {
        chartDataToUse = aggregateData(
          chartData,
          aggregate,
          selectedAggregateFunction
        );
      }

      addChartPage(
        selectedChartType,
        chartDataToUse,
        aggregate,
        selectedAggregateFunction,
        seriesLabels
      );
      resetChartData();
      setChartDropdownVisible(false);
    }
  };

  const renderChartDropdown = () => (
    <div
      className={styles.Dropdown}
      style={{
        top: chartButtonRef.current?.getBoundingClientRect().bottom,
        left: chartButtonRef.current?.getBoundingClientRect().left,
      }}
      onClick={(e) => e.stopPropagation()}
      ref={chartDropdownRef}
    >
      <div className={`${styles.textOption} ${styles.inputContainer}`}>
        <select
          id="chartType"
          value={selectedChartType}
          onChange={handleChartTypeChange}
          className={styles.input}
        >
          <option value="">Select chart type</option>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
          <option value="scatter">Scatter</option>
        </select>
      </div>
      {selectedChartType && (
        <div className={styles.textOption}>
          <label>
            <input
              type="checkbox"
              checked={aggregate}
              onChange={(e) => setAggregate(e.target.checked)}
            />
            {selectedChartType === "pie"
              ? "Aggregate Labels"
              : "Aggregate X-axis"}
          </label>
          {aggregate && (
            <select
              value={selectedAggregateFunction}
              onChange={(e) => setSelectedAggregateFunction(e.target.value)}
              className={styles.input}
            >
              <option value="SUM">SUM</option>
              <option value="AVERAGE">AVERAGE</option>
              <option value="MAX">MAX</option>
              <option value="MIN">MIN</option>
            </select>
          )}
        </div>
      )}
      {(selectedChartType === "line" ||
        selectedChartType === "scatter" ||
        selectedChartType === "bar") && (
        <>
          <AxisSelection
            axis="x"
            isLocked={isXAxisLocked}
            rangeString={generateRangeString(
              isXAxisLocked ? lockedRange.x : selectedRange
            )}
            isInvalidRange={isInvalidRange(selectedRange)}
            handleApply={() => handleApplyChartData("x")}
            handleReset={() => handleResetChartData("x")}
          />
          {Array.from({ length: seriesCount }).map((_, index) => (
            <AxisSelection
              key={index}
              axis="y"
              index={index}
              isLocked={isYAxisLocked[index]}
              rangeString={generateRangeString(
                isYAxisLocked[index] ? lockedRange.y[index] : selectedRange
              )}
              isInvalidRange={isInvalidRange(selectedRange)}
              handleApply={() => handleApplyChartData("y", index)}
              handleReset={() => handleResetChartData("y", index)}
              handleRemoveSeries={() => handleRemoveSeries(index)}
              seriesCount={seriesCount}
            />
          ))}
          <div className={styles.textOption}>
            <button onClick={handleAddSeries} className={styles.applyButton}>
              Add Series
            </button>
          </div>
          <div className={styles.textOption}>
            <button
              onClick={handleAddChart}
              className={styles.applyButton}
              disabled={isAddChartDisabled}
            >
              Add Chart
            </button>
          </div>
        </>
      )}
      {selectedChartType === "pie" && (
        <>
          <AxisSelection
            axis="x"
            isLocked={isXAxisLocked}
            rangeString={generateRangeString(
              isXAxisLocked ? lockedRange.x : selectedRange
            )}
            isInvalidRange={isInvalidRange(selectedRange)}
            handleApply={() => handleApplyChartData("x")}
            handleReset={() => handleResetChartData("x")}
          />
          <AxisSelection
            axis="y"
            index={0}
            isLocked={isYAxisLocked[0]}
            rangeString={generateRangeString(
              isYAxisLocked[0] ? lockedRange.y[0] : selectedRange
            )}
            isInvalidRange={isInvalidRange(selectedRange)}
            handleApply={() => handleApplyChartData("y", 0)}
            handleReset={() => handleResetChartData("y", 0)}
            seriesCount={seriesCount}
          />
          <div className={styles.textOption}>
            <button
              onClick={handleAddChart}
              className={styles.applyButton}
              disabled={isAddChartDisabled}
            >
              Add Chart
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {["Column", "Row", "Chart", "Functions"].map((item, index) => (
        <div
          key={index}
          className={styles.secondaryMenuItem}
          onClick={() => handleMenuClick(item)}
        >
          <button
            ref={item === "Chart" ? chartButtonRef : null}
            className={styles.button}
          >
            {item}
          </button>
          {item === "Chart" && isChartDropdownVisible && renderChartDropdown()}
        </div>
      ))}
    </>
  );
};

const AxisSelection = ({
  axis,
  index,
  isLocked,
  rangeString,
  isInvalidRange,
  handleApply,
  handleReset,
  handleRemoveSeries,
  seriesCount,
}) => (
  <div
    className={styles.textOption}
    style={{ backgroundColor: isLocked ? "#e0e0e0" : "transparent" }}
  >
    <label>
      {axis === "x"
        ? `Selected X-axis: ${rangeString}`
        : `Selected Series ${index + 1}: ${rangeString}`}
      {isInvalidRange && !isLocked && (
        <strong style={{ color: "red" }}>
          {" "}
          Please select data of a single row/column
        </strong>
      )}
    </label>
    <button
      onClick={isLocked ? handleReset : handleApply}
      className={styles.applyButton}
      disabled={isInvalidRange && !isLocked}
    >
      {isLocked ? "Reset" : "Apply"}
    </button>
    {axis === "y" && (
      <button
        onClick={handleRemoveSeries}
        className={styles.applyButton}
        disabled={seriesCount === 1}
      >
        Remove
      </button>
    )}
  </div>
);

export default InsertMenu;
