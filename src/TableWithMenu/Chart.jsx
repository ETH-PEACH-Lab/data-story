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

  const chartData = {
    labels: aggregatedData.x,
    datasets: aggregatedData.y.map((series, idx) => ({
      label: `Series ${idx + 1}`,
      data: series,
      fill: false,
      backgroundColor: `rgba(${idx * 60}, ${idx * 30}, ${idx * 90}, 0.6)`,
      borderColor: `rgba(${idx * 60}, ${idx * 30}, ${idx * 90}, 1)`,
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
