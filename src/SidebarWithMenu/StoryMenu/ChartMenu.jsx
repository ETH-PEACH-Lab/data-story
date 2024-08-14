import React, { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";

const ChartMenu = ({ addComponent, chartNames = [], chartConfigs = [] }) => {
  const [selectedChartName, setSelectedChartName] = useState("");

  const transformChartConfig = (chartConfig) => {
    if (!chartConfig || !chartConfig.data || !chartConfig.colors) {
      console.error("Invalid chart configuration", chartConfig);
      return chartConfig;
    }

    const { data, colors, type, seriesLabels, pieLabels, title } = chartConfig;

    const transformedData = {
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

    const transformedConfig = {
      ...chartConfig,
      data: transformedData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title || `Chart ${chartConfig.index}`,
            font: {
              size: 24,
            },
            color: "#000",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: chartConfig.xAxisTitle || "x-axis",
              font: {
                size: 16,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: chartConfig.yAxisTitle || "y-axis",
              font: {
                size: 16,
              },
            },
          },
        },
      },
    };

    return transformedConfig;
  };

  const handleInsertClick = () => {
    const selectedChartConfig = chartConfigs.find(
      (chartConfig) => chartConfig.title === selectedChartName
    );
    if (selectedChartConfig) {
      const transformedConfig = transformChartConfig(selectedChartConfig);
      addComponent("chart", [], [], [], "", "", transformedConfig);
    } else {
      console.error("Selected chart configuration not found");
    }
  };

  const filteredChartNames = chartNames.filter((name) => name !== "Table");

  return (
    <Card className="mb-3">
      <Card.Body>
        <Form.Group controlId="chartSelect" className="mb-3">
          <Form.Control
            as="select"
            value={selectedChartName}
            onChange={(e) => setSelectedChartName(e.target.value)}
          >
            <option value="" disabled>
              Select Chart Name
            </option>
            {filteredChartNames.map((chartName, index) => (
              <option key={index} value={chartName}>
                {chartName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button
          onClick={handleInsertClick}
          variant="secondary"
          disabled={!selectedChartName}
        >
          Insert
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ChartMenu;
