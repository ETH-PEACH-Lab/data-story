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

  const chartData = {
    labels: type === "pie" ? pieLabels : aggregatedData.x,
    datasets: aggregatedData.y.map((series, idx) => ({
      label: type === "pie" ? "" : seriesLabels[idx] || `Series ${idx + 1}`,
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
