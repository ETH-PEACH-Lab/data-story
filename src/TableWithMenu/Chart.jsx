import React, { useState, useEffect } from "react";
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
import { CirclePicker } from "react-color";

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

const generateMutedRainbowColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    const saturation = 50;
    const lightness = 60;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // Convert to Hex and ensure it is 2 digits
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const Chart = ({
  type,
  data,
  index,
  aggregate,
  aggregateFunction,
  chartNotes,
  setChartNotes,
  editingNote,
  setEditingNote,
  seriesLabels,
  setSeriesLabels,
  pieLabels,
  setPieLabels,
  aggregateData,
  colors,
  setColors,
}) => {
  const handleNoteChange = (e) => {
    setChartNotes({
      ...chartNotes,
      [index]: e.target.value,
    });
  };

  const handleNoteBlur = () => {
    setEditingNote(null);
  };

  // Apply aggregation
  const aggregatedData = aggregateData(data, aggregate, aggregateFunction);

  const [selectedItem, setSelectedItem] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isRenamingVisible, setIsRenamingVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState("");

  const customColors = generateMutedRainbowColors(18).map((color) => {
    const [h, s, l] = color.match(/\d+/g).map(Number);
    return hslToHex(h, s, l);
  });

  useEffect(() => {
    if (selectedItem !== "") {
      setCurrentColor(colors[parseInt(selectedItem)]);
    }
  }, [selectedItem, colors]);

  const handleItemSelect = (e) => {
    setSelectedItem(e.target.value);
    setCurrentColor(colors[parseInt(e.target.value)]); // Ensure color is updated when item is selected
  };

  const handleNewLabelChange = (e) => {
    setNewLabel(e.target.value);
  };

  const handleRenameItem = () => {
    if (type === "pie") {
      const newLabels = pieLabels.map((label, idx) =>
        idx === parseInt(selectedItem) ? newLabel : label
      );
      setPieLabels(index, newLabels);
    } else {
      const newLabels = seriesLabels.map((label, idx) =>
        idx === parseInt(selectedItem) ? newLabel : label
      );
      setSeriesLabels(index, newLabels);
    }
    setSelectedItem("");
    setNewLabel("");
  };

  const handleColorChangeComplete = (color) => {
    console.log("Color selected:", color.hex);
    setCurrentColor(color.hex);
    setColorPickerVisible(false); // Close the color picker after selecting a color
  };

  const handleApplyColor = () => {
    const newColors = [...colors];
    newColors[parseInt(selectedItem)] = currentColor;
    console.log("Applying color:", currentColor, "to item:", selectedItem);
    console.log("New colors array:", newColors);
    setColors(index, newColors);
  };

  const chartData = {
    labels: type === "pie" ? pieLabels : aggregatedData.x,
    datasets:
      type === "pie"
        ? [
            {
              data: aggregatedData.y[0],
              backgroundColor: colors,
              borderColor: colors,
            },
          ]
        : aggregatedData.y.map((series, idx) => ({
            label: seriesLabels[idx] || `Series ${idx + 1}`,
            data: series,
            fill: false,
            backgroundColor: colors[idx],
            borderColor: colors[idx],
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
    <div className="handsontable-container">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <button onClick={() => setIsRenamingVisible(!isRenamingVisible)}>
            {isRenamingVisible ? "Hide" : "Edit"}
          </button>
          {isRenamingVisible && (
            <div style={{ display: "flex", marginLeft: "10px" }}>
              <select onChange={handleItemSelect} value={selectedItem}>
                <option value="">
                  Select {type === "pie" ? "Slice" : "Series"}
                </option>
                {(type === "pie" ? pieLabels : seriesLabels).map(
                  (label, idx) => (
                    <option key={idx} value={idx}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>
        {isRenamingVisible && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={newLabel}
                onChange={handleNewLabelChange}
                placeholder={`New ${type === "pie" ? "Slice" : "Series"} Label`}
                style={{ marginLeft: "10px" }}
              />
              <button onClick={handleRenameItem} style={{ marginLeft: "10px" }}>
                Rename
              </button>
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                onClick={() => setColorPickerVisible(!colorPickerVisible)}
                style={{
                  width: "36px",
                  height: "14px",
                  backgroundColor: currentColor,
                  marginLeft: "10px",
                  cursor: "pointer",
                  border: "1px solid #000",
                }}
              />
              <button onClick={handleApplyColor} style={{ marginLeft: "10px" }}>
                Apply Color
              </button>
              {colorPickerVisible && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                    }}
                    onClick={() => setColorPickerVisible(false)}
                  />
                  <CirclePicker
                    color={currentColor}
                    colors={customColors}
                    onChangeComplete={handleColorChangeComplete}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <textarea
        className="editable-textarea"
        value={chartNotes[index] || "Title"}
        onChange={handleNoteChange}
        onBlur={handleNoteBlur}
        onFocus={() => setEditingNote(index)}
        style={{
          outline: editingNote === index ? "1px dashed black" : "none",
          backgroundColor: editingNote === index ? "white" : "transparent",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChartComponent key={index} data={chartData} options={chartOptions} />
      </div>
    </div>
  ) : null;
};

export default Chart;
