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
  Title as ChartTitle,
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
  ChartTitle,
  Tooltip,
  Legend
);

export const originalColors = [
  "#000000",
  "#AB14E2",
  "#FF0000",
  "#FF8700",
  "#FFD300",
  "#0AEFFF",
  "#580AFF",
  "#1C7B53",
  "#A1FF0A",
];

export function tintColor(color, percentage) {
  const decimalPercentage = percentage / 100;
  const hex = color.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.round(r + (255 - r) * decimalPercentage);
  const newG = Math.round(g + (255 - g) * decimalPercentage);
  const newB = Math.round(b + (255 - b) * decimalPercentage);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

export const tintedColors = originalColors.map((color) => tintColor(color, 60));
const allColors = [...originalColors, ...tintedColors];

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
  updateChartTitle,
  updateFooterName,
  title,
  xAxisTitle,
  yAxisTitle,
  updateXAxisTitle,
  updateYAxisTitle,
  onDeleteChart,
}) => {
  const handleNoteChange = (e) => {
    setChartNotes({ ...chartNotes, [index]: e.target.value });
  };

  const handleNoteBlur = () => {
    setEditingNote(null);
  };

  if (!data || !data.y || !Array.isArray(data.y) || data.y.length === 0) {
    console.error("Invalid data structure in Chart component", data);
    return <div>Error: Invalid data structure</div>;
  }

  const aggregatedData = aggregateData(data, aggregate, aggregateFunction);

  const [selectedItem, setSelectedItem] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isRenamingVisible, setIsRenamingVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState("");
  const [titleText, setTitleText] = useState(title);
  const [newXAxisTitle, setNewXAxisTitle] = useState(xAxisTitle);
  const [newYAxisTitle, setNewYAxisTitle] = useState(yAxisTitle);
  const [selectedModification, setSelectedModification] = useState("");

  const customColors = allColors;

  useEffect(() => {
    setTitleText(title);
    setNewXAxisTitle(xAxisTitle);
    setNewYAxisTitle(yAxisTitle);
  }, [title, xAxisTitle, yAxisTitle]);

  const handleItemSelect = (e) => {
    setSelectedItem(e.target.value);
    setCurrentColor(colors[parseInt(e.target.value)]);
  };

  const handleNewLabelChange = (e) => {
    setNewLabel(e.target.value);
  };

  const handleRenameItem = () => {
    const updateLabels = (labels) =>
      labels.map((label, idx) =>
        idx === parseInt(selectedItem) ? newLabel : label
      );
    if (type === "pie") setPieLabels(index, updateLabels(pieLabels));
    else setSeriesLabels(index, updateLabels(seriesLabels));
    setSelectedItem("");
    setNewLabel("");
  };

  const handleColorChangeComplete = (color) => {
    setCurrentColor(color.hex);
    setColorPickerVisible(false);
  };

  const handleApplyColor = () => {
    const newColors = [...colors];
    newColors[parseInt(selectedItem)] = currentColor;
    setColors(index, newColors);
  };

  const handleTitleChange = () => {
    const updatedTitle = titleText.trim() || `Chart ${index}`;
    updateChartTitle(index, updatedTitle);
    updateFooterName(index, updatedTitle);
  };

  const handleXAxisTitleChange = () => {
    updateXAxisTitle(index, newXAxisTitle);
  };

  const handleYAxisTitleChange = () => {
    updateYAxisTitle(index, newYAxisTitle);
  };

  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 24 },
        color: "#000",
      },
    },
    scales: {
      x: { title: { display: true, text: xAxisTitle, font: { size: 16 } } },
      y: { title: { display: true, text: yAxisTitle, font: { size: 16 } } },
    },
  });

  useEffect(() => {
    setChartOptions((prevOptions) => ({
      ...prevOptions,
      plugins: {
        ...prevOptions.plugins,
        title: { ...prevOptions.plugins.title, text: title },
      },
      scales: {
        x: {
          ...prevOptions.scales.x,
          title: { ...prevOptions.scales.x.title, text: xAxisTitle },
        },
        y: {
          ...prevOptions.scales.y,
          title: { ...prevOptions.scales.y.title, text: yAxisTitle },
        },
      },
    }));
  }, [title, xAxisTitle, yAxisTitle]);

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

  const ChartComponent = { line: Line, bar: Bar, pie: Pie, scatter: Scatter }[
    type
  ];

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
          <button
            onClick={() => setIsRenamingVisible(!isRenamingVisible)}
            style={{
              height: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isRenamingVisible ? "Hide" : "Edit"}
          </button>
          {isRenamingVisible && (
            <div style={{ display: "flex", marginLeft: "10px" }}>
              <select
                onChange={(e) => setSelectedModification(e.target.value)}
                value={selectedModification}
              >
                <option value="">Select Modification</option>
                <option value="title">Title</option>
                <option value="axis-titles">Axis Titles</option>
                <option value="color">Color</option>
                <option value="name">Name</option>
              </select>
              <button
                onClick={() => onDeleteChart(index)}
                style={{
                  display: "flex",
                  backgroundColor: "#dc3546b8",
                  color: "white",
                  height: "25px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isRenamingVisible && selectedModification === "title" && (
          <div style={{ marginTop: "10px", display: "flex" }}>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="New Title"
              style={{ marginLeft: "10px" }}
            />
            <button
              onClick={handleTitleChange}
              style={{
                marginLeft: "10px",
                height: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Change Title
            </button>
          </div>
        )}

        {isRenamingVisible && selectedModification === "axis-titles" && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "10px", display: "flex" }}>
              <input
                type="text"
                value={newXAxisTitle}
                onChange={(e) => setNewXAxisTitle(e.target.value)}
                placeholder="New X-Axis Title"
                style={{ marginLeft: "10px" }}
              />
              <button
                onClick={handleXAxisTitleChange}
                style={{
                  marginLeft: "10px",
                  height: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Change X-Axis
              </button>
            </div>
            <div style={{ display: "flex" }}>
              <input
                type="text"
                value={newYAxisTitle}
                onChange={(e) => setNewYAxisTitle(e.target.value)}
                placeholder="New Y-Axis Title"
                style={{ marginLeft: "10px" }}
              />
              <button
                onClick={handleYAxisTitleChange}
                style={{
                  marginLeft: "10px",
                  height: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Change Y-Axis
              </button>
            </div>
          </div>
        )}

        {isRenamingVisible && selectedModification === "color" && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
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
              <button
                onClick={handleApplyColor}
                style={{
                  marginLeft: "10px",
                  height: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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

        {isRenamingVisible && selectedModification === "name" && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
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
              <input
                type="text"
                value={newLabel}
                onChange={handleNewLabelChange}
                placeholder={`New ${type === "pie" ? "Slice" : "Series"} Label`}
                style={{ marginLeft: "10px" }}
              />
              <button
                onClick={handleRenameItem}
                style={{
                  marginLeft: "10px",
                  height: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Rename
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChartComponent key={index} data={chartData} options={chartOptions} />
      </div>
    </div>
  ) : null;
};

export default Chart;
