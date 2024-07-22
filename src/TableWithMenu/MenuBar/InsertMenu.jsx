import React, { useState, useRef, useEffect } from "react";
import styles from "./MenuBar.module.css";

const InsertMenu = ({
  addRow,
  addColumn,
  hotRef,
  addChartPage,
  selectedRange,
}) => {
  const [isChartDropdownVisible, setChartDropdownVisible] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState("");
  const [chartData, setChartData] = useState({ x: [], y: [] });
  const [isXAxisLocked, setXAxisLocked] = useState(false);
  const [isYAxisLocked, setYAxisLocked] = useState([]);
  const [lockedRange, setLockedRange] = useState({ x: null, y: [] });
  const [seriesCount, setSeriesCount] = useState(1);
  const chartDropdownRef = useRef(null);
  const chartButtonRef = useRef(null);

  const handleMenuClick = (item) => {
    if (item === "Row") {
      addRow();
    } else if (item === "Column") {
      addColumn();
    } else if (item === "Chart") {
      setChartDropdownVisible(!isChartDropdownVisible);
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
      // Do something with the selected range if needed
    }
  }, [selectedRange]);

  const handleChartTypeChange = (event) => {
    setSelectedChartType(event.target.value);
    setChartData({ x: [], y: [] }); // Reset chart data when type changes
    setXAxisLocked(false);
    setYAxisLocked([]);
    setLockedRange({ x: null, y: [] });
    setSeriesCount(1); // Reset series count
  };

  const handleApplyChartData = (axis, index = 0) => {
    if (!selectedRange || isInvalidRange(selectedRange)) {
      return;
    }

    const hotInstance = hotRef.current.hotInstance;
    const selectedData = hotInstance.getData(
      selectedRange.minRow,
      selectedRange.minCol,
      selectedRange.maxRow,
      selectedRange.maxCol
    );
    if (axis === "x") {
      setChartData((prevState) => ({
        ...prevState,
        x: selectedData.flat(), // Flatten data
      }));
      setXAxisLocked(true);
      setLockedRange((prevState) => ({
        ...prevState,
        x: selectedRange,
      }));
    } else if (axis === "y") {
      setChartData((prevState) => {
        const newY = [...prevState.y];
        newY[index] = selectedData.flat();
        return {
          ...prevState,
          y: newY,
        };
      });
      setYAxisLocked((prevState) => {
        const newLocked = [...prevState];
        newLocked[index] = true;
        return newLocked;
      });
      setLockedRange((prevState) => {
        const newY = [...prevState.y];
        newY[index] = selectedRange;
        return {
          ...prevState,
          y: newY,
        };
      });
    }
  };

  const handleResetChartData = (axis, index = 0) => {
    if (axis === "x") {
      setChartData((prevState) => ({
        ...prevState,
        x: [],
      }));
      setXAxisLocked(false);
      setLockedRange((prevState) => ({
        ...prevState,
        x: null,
      }));
    } else if (axis === "y") {
      setChartData((prevState) => {
        const newY = [...prevState.y];
        newY[index] = [];
        return {
          ...prevState,
          y: newY,
        };
      });
      setYAxisLocked((prevState) => {
        const newLocked = [...prevState];
        newLocked[index] = false;
        return newLocked;
      });
      setLockedRange((prevState) => {
        const newY = [...prevState.y];
        newY[index] = null;
        return {
          ...prevState,
          y: newY,
        };
      });
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
  };

  const handleAddChart = () => {
    if (!isAddChartDisabled) {
      addChartPage(selectedChartType, chartData); // Pass chart type and data
      // Reset state for new chart
      setSelectedChartType("");
      setChartData({ x: [], y: [] });
      setXAxisLocked(false);
      setYAxisLocked([]);
      setLockedRange({ x: null, y: [] });
      setSeriesCount(1);
      setChartDropdownVisible(false); // Optionally close the dropdown after adding the chart
    }
  };

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
          {item === "Chart" && isChartDropdownVisible && (
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
              {(selectedChartType === "line" ||
                selectedChartType === "scatter" ||
                selectedChartType === "bar") && (
                <>
                  <div
                    className={styles.textOption}
                    style={{
                      backgroundColor: isXAxisLocked
                        ? "#e0e0e0"
                        : "transparent",
                    }}
                  >
                    <label>
                      Selected X-axis:{" "}
                      {isXAxisLocked
                        ? generateRangeString(lockedRange.x)
                        : generateRangeString(selectedRange)}
                      {isInvalidRange(selectedRange) && !isXAxisLocked && (
                        <strong style={{ color: "red" }}>
                          {" "}
                          Please select data of a single row/column
                        </strong>
                      )}
                    </label>
                    <button
                      onClick={() =>
                        isXAxisLocked
                          ? handleResetChartData("x")
                          : handleApplyChartData("x")
                      }
                      className={styles.applyButton}
                      disabled={isInvalidRange(selectedRange) && !isXAxisLocked}
                    >
                      {isXAxisLocked ? "Reset" : "Apply"}
                    </button>
                  </div>
                  {Array.from({ length: seriesCount }).map((_, index) => (
                    <div
                      key={index}
                      className={styles.textOption}
                      style={{
                        backgroundColor: isYAxisLocked[index]
                          ? "#e0e0e0"
                          : "transparent",
                      }}
                    >
                      <label>
                        Selected Series {index + 1}:{" "}
                        {isYAxisLocked[index]
                          ? generateRangeString(lockedRange.y[index])
                          : generateRangeString(selectedRange)}
                        {isInvalidRange(selectedRange) &&
                          !isYAxisLocked[index] && (
                            <strong style={{ color: "red" }}>
                              {" "}
                              Please select data of a single row/column
                            </strong>
                          )}
                      </label>
                      <button
                        onClick={() =>
                          isYAxisLocked[index]
                            ? handleResetChartData("y", index)
                            : handleApplyChartData("y", index)
                        }
                        className={styles.applyButton}
                        disabled={
                          isInvalidRange(selectedRange) && !isYAxisLocked[index]
                        }
                      >
                        {isYAxisLocked[index] ? "Reset" : "Apply"}
                      </button>
                      <button
                        onClick={() => handleRemoveSeries(index)}
                        className={styles.applyButton}
                        disabled={seriesCount === 1} // Disable removing the last series
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className={styles.textOption}>
                    <button
                      onClick={handleAddSeries}
                      className={styles.applyButton}
                    >
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
                  <div
                    className={styles.textOption}
                    style={{
                      backgroundColor: isXAxisLocked
                        ? "#e0e0e0"
                        : "transparent",
                    }}
                  >
                    <label>
                      Selected Labels:{" "}
                      {isXAxisLocked
                        ? generateRangeString(lockedRange.x)
                        : generateRangeString(selectedRange)}
                      {isInvalidRange(selectedRange) && !isXAxisLocked && (
                        <strong style={{ color: "red" }}>
                          {" "}
                          Please select data of a single row/column
                        </strong>
                      )}
                    </label>
                    <button
                      onClick={() =>
                        isXAxisLocked
                          ? handleResetChartData("x")
                          : handleApplyChartData("x")
                      }
                      className={styles.applyButton}
                      disabled={isInvalidRange(selectedRange) && !isXAxisLocked}
                    >
                      {isXAxisLocked ? "Reset" : "Apply"}
                    </button>
                  </div>
                  <div
                    className={styles.textOption}
                    style={{
                      backgroundColor: isYAxisLocked[0]
                        ? "#e0e0e0"
                        : "transparent",
                    }}
                  >
                    <label>
                      Selected Values:{" "}
                      {isYAxisLocked[0]
                        ? generateRangeString(lockedRange.y[0])
                        : generateRangeString(selectedRange)}
                      {isInvalidRange(selectedRange) && !isYAxisLocked[0] && (
                        <strong style={{ color: "red" }}>
                          {" "}
                          Please select data of a single row/column
                        </strong>
                      )}
                    </label>
                    <button
                      onClick={() =>
                        isYAxisLocked[0]
                          ? handleResetChartData("y", 0)
                          : handleApplyChartData("y", 0)
                      }
                      className={styles.applyButton}
                      disabled={
                        isInvalidRange(selectedRange) && !isYAxisLocked[0]
                      }
                    >
                      {isYAxisLocked[0] ? "Reset" : "Apply"}
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
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default InsertMenu;
