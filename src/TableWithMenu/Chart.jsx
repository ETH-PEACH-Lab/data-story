import React, { useState } from "react";
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

// Function to generate muted rainbow colors
const generateMutedRainbowColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    const saturation = 50; // Decreased saturation for muted effect
    const lightness = 60; // Adjusted lightness for a balanced look
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

// Function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

  const aggregatedData = aggregateData(data, aggregate, aggregateFunction);

  const [selectedItem, setSelectedItem] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const handleItemSelect = (e) => {
    setSelectedItem(e.target.value);
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

  const colors = shuffleArray(
    generateMutedRainbowColors(
      type === "pie" ? aggregatedData.y[0].length : aggregatedData.y.length
    )
  );

  const chartData = {
    labels: type === "pie" ? pieLabels : aggregatedData.x,
    datasets: aggregatedData.y.map((series, idx) => ({
      label: type === "pie" ? "" : seriesLabels[idx],
      data: series,
      fill: false,
      backgroundColor: type === "pie" ? colors : colors[idx],
      borderColor: type === "pie" ? colors : colors[idx],
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <select onChange={handleItemSelect} value={selectedItem}>
          <option value="">Select {type === "pie" ? "Slice" : "Series"}</option>
          {(type === "pie" ? pieLabels : seriesLabels).map((label, idx) => (
            <option key={idx} value={idx}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newLabel}
          onChange={handleNewLabelChange}
          placeholder={`New ${type === "pie" ? "Slice" : "Series"} Label`}
        />
        <button onClick={handleRenameItem}>Rename</button>
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
