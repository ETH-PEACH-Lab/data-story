import React from "react";
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
import "../Story.css";
import EditMenu from "./EditMenu";

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

const ChartComponent = {
  line: Line,
  bar: Bar,
  pie: Pie,
  scatter: Scatter,
};

const StoryChart = ({
  index,
  chartConfig,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMenuVisible,
  setVisibleMenuIndex,
}) => {
  if (!chartConfig) {
    return <div>Error: Chart configuration is missing.</div>;
  }

  console.log("ChartConfig passed to StoryChart:", chartConfig);

  const ChartToRender = ChartComponent[chartConfig.type];

  if (!ChartToRender) {
    return <div>Error: Invalid chart type.</div>;
  }

  const { data } = chartConfig;

  if (
    !data ||
    !Array.isArray(data.labels) ||
    !Array.isArray(data.datasets) ||
    data.datasets.some(
      (dataset) => !Array.isArray(dataset.data) || dataset.data.length === 0
    )
  ) {
    console.error("Invalid chart data structure", data);
    return <div>Error: Invalid chart data structure</div>;
  }

  //TODO: add title and axis titles

  return (
    <div className="chart-container">
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          ⋮
        </button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
      )}
      <div className="chart">
        <ChartToRender data={data} options={chartConfig.options} />
      </div>
    </div>
  );
};

export default StoryChart;
