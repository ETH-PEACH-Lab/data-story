import React, { useState, useEffect, useRef } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";

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
  const colorPickerRef = useRef(null); // Reference to the color picker

  const numericXValues = data.x.map((value) =>
    isNaN(value) ? value : Number(value)
  );

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
      x: {
        title: { display: true, text: xAxisTitle, font: { size: 16 } },
        type: type === "line" || type === "scatter" ? "linear" : "category",
      },
      y: {
        title: { display: true, text: yAxisTitle, font: { size: 16 } },
      },
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
    labels: type === "pie" ? pieLabels : data.x,
    datasets:
      type === "pie"
        ? [
            {
              data: data.y[0],
              backgroundColor: colors,
              borderColor: colors,
            },
          ]
        : data.y.map((series, idx) => ({
            label: seriesLabels[idx] || `Series ${idx + 1}`,
            data: series,
            fill: false,
            backgroundColor: colors[idx],
            borderColor: colors[idx],
          })),
  };

  console.log("Chart Data:", chartData);

  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    scatter: Scatter,
  }[type];

  const chartContainerStyle = {
    marginLeft: type ? "8px" : "0px",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setColorPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerRef]);

  return ChartComponent ? (
    <div className="handsontable-container" style={chartContainerStyle}>
      <div className="d-flex flex-column align-items-start">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setIsRenamingVisible(!isRenamingVisible)}
            style={{ marginLeft: "30px" }}
          >
            {isRenamingVisible ? "Hide" : "Edit"}
          </button>
          {isRenamingVisible && (
            <div className="d-flex ms-2">
              <select
                className="form-select"
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
                className="btn btn-danger ms-2"
                onClick={() => onDeleteChart(index)}
              >
                <i className="bi bi-trash3"></i>
              </button>
            </div>
          )}
        </div>

        {isRenamingVisible && selectedModification === "title" && (
          <div className="d-flex mt-2" style={{ marginLeft: "22px" }}>
            <input
              type="text"
              className="form-control ms-2"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="New Title"
            />
            <button
              className="btn btn-primary ms-2"
              style={{
                fontSize: "14px",
                padding: "5px 10px",
                whiteSpace: "nowrap",
              }}
              onClick={handleTitleChange}
            >
              Change Title
            </button>
          </div>
        )}

        {isRenamingVisible && selectedModification === "axis-titles" && (
          <div className="mt-2" style={{ marginLeft: "22px" }}>
            <div className="d-flex mb-2">
              <input
                type="text"
                className="form-control ms-2"
                value={newXAxisTitle}
                onChange={(e) => setNewXAxisTitle(e.target.value)}
                placeholder="New X-Axis Title"
              />
              <button
                className="btn btn-primary ms-2"
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}
                onClick={handleXAxisTitleChange}
              >
                Change X-Axis
              </button>
            </div>
            <div className="d-flex">
              <input
                type="text"
                className="form-control ms-2"
                value={newYAxisTitle}
                onChange={(e) => setNewYAxisTitle(e.target.value)}
                placeholder="New Y-Axis Title"
              />
              <button
                className="btn btn-primary ms-2"
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}
                onClick={handleYAxisTitleChange}
              >
                Change Y-Axis
              </button>
            </div>
          </div>
        )}

        {isRenamingVisible && selectedModification === "color" && (
          <div className="mt-2" style={{ marginLeft: "30px" }}>
            <div className="d-flex align-items-center">
              <select
                className="form-select"
                onChange={handleItemSelect}
                value={selectedItem}
              >
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
                className="ms-2"
                style={{
                  width: "75px",
                  height: "36px",
                  backgroundColor: currentColor,
                  cursor: "pointer",
                  border: "1px solid #000",
                }}
              />
              <button
                className="btn btn-primary ms-2"
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}
                onClick={handleApplyColor}
              >
                Apply Color
              </button>
              {colorPickerVisible && (
                <div
                  ref={colorPickerRef} // Reference to the color picker container
                  className="dropdown-menu show"
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    marginTop: "30px",
                    backgroundColor: "white",
                  }}
                >
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
          <div className="mt-2" style={{ marginLeft: "30px" }}>
            <div className="d-flex align-items-center">
              <select
                className="form-select"
                onChange={handleItemSelect}
                value={selectedItem}
              >
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
                className="form-control ms-2"
                value={newLabel}
                onChange={handleNewLabelChange}
                placeholder={`New ${type === "pie" ? "Slice" : "Series"} Label`}
              />
              <button
                className="btn btn-primary ms-2"
                onClick={handleRenameItem}
              >
                Rename
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginTop: "0px",
          marginLeft: "20px",
        }}
      >
        <ChartComponent key={index} data={chartData} options={chartOptions} />
      </div>
    </div>
  ) : null;
};

export default Chart;
