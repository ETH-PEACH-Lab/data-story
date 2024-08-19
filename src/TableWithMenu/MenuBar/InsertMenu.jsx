import React, { useState, useRef, useEffect } from "react";

const InsertMenu = ({
  addRow,
  addColumn,
  hotRef,
  addChartPage,
  selectedRange,
  aggregateData,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
}) => {
  const [activeItem, setActiveItem] = useState("");
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

  const handleMenuClick = (item) => {
    if (item === "Chart") {
      setActiveItem(activeItem === item ? "" : item);
    } else if (item === "Row") {
      addRow();
    } else if (item === "Column") {
      addColumn();
    }
  };

  const handleChartTypeChange = (event) => {
    setSelectedChartType(event.target.value);
    resetChartData();
  };

  useEffect(() => {
    resetChartData();
  }, [selectedChartType]);

  const resetChartData = () => {
    setChartData({ x: [], y: [] });
    setXAxisLocked(false);
    setYAxisLocked(new Array(seriesCount).fill(false));
    setLockedRange({ x: null, y: new Array(seriesCount).fill(null) });
    setSeriesLabels(new Array(seriesCount).fill(""));
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

    // Check if the data contains non-numerical values
    const containsNonNumerical = selectedData.some((value) => isNaN(value));

    if (axis === "x") {
      if (containsNonNumerical && selectedChartType === "scatter") {
        // Set the message and callback for the popup in the App component
        setConfirmationMessage(
          "Non-numerical values cannot be used for the x-axis of a scatter plot."
        );
        setOnConfirmAction(() => null); // No action needed, just dismiss the popup
        setShowConfirmation(true);
      } else {
        setChartData((prevState) => ({ ...prevState, x: selectedData }));
        setXAxisLocked(true);
        setLockedRange((prevState) => ({ ...prevState, x: selectedRange }));
      }
    } else if (axis === "y") {
      if (containsNonNumerical) {
        // Set the message and callback for the popup in the App component
        setConfirmationMessage(
          "Non-numerical values cannot be used for series."
        );
        setOnConfirmAction(() => null); // No action needed, just dismiss the popup
        setShowConfirmation(true);
      } else {
        // If data is numerical, proceed without confirmation
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
        setSeriesLabels((prevLabels) => {
          const newLabels = [...prevLabels];
          newLabels[index] = hotInstance.getColHeader(selectedRange.minCol);
          return newLabels;
        });
      }
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
      setActiveItem("");
    }
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
    return rowCount > 1 && colCount > 1; // Invalid if more than one row and one column are selected
  };

  const isAddChartDisabled = () => {
    if (selectedChartType === "pie") {
      return !isXAxisLocked || !isYAxisLocked[0];
    } else {
      return !isXAxisLocked || !isYAxisLocked.every((locked) => locked);
    }
  };

  const handleAddSeries = () => {
    setSeriesCount((prevCount) => prevCount + 1);
    setYAxisLocked((prevLocked) => [...prevLocked, false]);
    setLockedRange((prevRange) => ({
      ...prevRange,
      y: [...prevRange.y, null],
    }));
    setSeriesLabels((prevLabels) => [...prevLabels, ""]);
  };

  const activeButtonColor = {
    backgroundColor: "var(--secondary)", // Define your active color here
    color: "white",
  };

  return (
    <div>
      <div className="d-flex gap-2">
        {["Column", "Row", "Chart", "Functions"].map((item, index) => (
          <button
            key={index}
            className="btn btn-outline-secondary"
            onClick={() => handleMenuClick(item)}
            style={activeItem === item ? activeButtonColor : {}}
          >
            {item}
          </button>
        ))}
      </div>

      <div>
        <div className={`collapse ${activeItem === "Chart" ? "show" : ""}`}>
          <div
            className="card card-body"
            style={{
              width: "400px",
              marginTop: "8px",
            }}
          >
            <div className="d-flex gap-2">
              <select
                id="chartType"
                value={selectedChartType}
                onChange={handleChartTypeChange}
                className="form-select"
              >
                <option value="">Select chart type</option>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="scatter">Scatter</option>
              </select>
            </div>
            {selectedChartType && (
              <div>
                <label className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    checked={aggregate}
                    onChange={(e) => setAggregate(e.target.checked)}
                    className="me-2"
                  />
                  {selectedChartType === "pie"
                    ? "Aggregate Labels"
                    : "Aggregate X-axis"}
                </label>
                {aggregate && (
                  <select
                    value={selectedAggregateFunction}
                    onChange={(e) =>
                      setSelectedAggregateFunction(e.target.value)
                    }
                    className="form-select"
                    style={{ width: "auto" }} // Adjust width as needed
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
                      isYAxisLocked[index]
                        ? lockedRange.y[index]
                        : selectedRange
                    )}
                    isInvalidRange={isInvalidRange(selectedRange)}
                    handleApply={() => handleApplyChartData("y", index)}
                    handleReset={() => handleResetChartData("y", index)}
                    handleRemoveSeries={() => handleRemoveSeries(index)}
                    seriesCount={seriesCount}
                  />
                ))}
                <div className="d-flex gap-2">
                  <button
                    onClick={handleAddSeries}
                    className="btn btn-secondary"
                    style={{ marginTop: "8px" }}
                  >
                    Add Series
                  </button>
                  <button
                    onClick={handleAddChart}
                    className="btn btn-primary"
                    disabled={isAddChartDisabled()}
                    style={{ marginTop: "8px" }}
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
                <div className="d-flex gap-2">
                  <button
                    onClick={handleAddChart}
                    className="btn btn-primary"
                    disabled={isAddChartDisabled()}
                    style={{ marginTop: "8px" }}
                  >
                    Add Chart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
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
  <div>
    <label>
      {axis === "x"
        ? `Selected X-axis: ${rangeString}`
        : `Selected Series ${index + 1}: ${rangeString}`}
      {isInvalidRange && !isLocked && (
        <strong className="text-danger">
          {" "}
          Please select data of a single row/column
        </strong>
      )}
    </label>
    <div className="d-flex gap-2">
      <button
        onClick={isLocked ? handleReset : handleApply}
        className="btn btn-secondary"
        disabled={isInvalidRange && !isLocked}
      >
        {isLocked ? "Reset" : "Apply"}
      </button>
      {axis === "y" && (
        <button
          onClick={handleRemoveSeries}
          className="btn btn-danger"
          disabled={seriesCount === 1}
        >
          Remove
        </button>
      )}
    </div>
  </div>
);

export default InsertMenu;
