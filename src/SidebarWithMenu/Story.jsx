import React, { useEffect, useState } from "react";
import EditableText from "./EditableStoryComponents/EditableText";
import Function from "./EditableStoryComponents/Function";
import StoryChart from "./EditableStoryComponents/StoryChart";
import StoryTable from "./EditableStoryComponents/StoryTable"; // Import the StoryTable component
import "./Story.css";

function Story({ components, setComponents, data, columnConfigs }) {
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);

  const handleAddComponent = (
    type,
    selectedColumns = [],
    highlightSettings = [],
    highlightColors = [],
    func = "",
    result = "",
    chartConfig = null
  ) => {
    const newComponent =
      type === "chart"
        ? { type, chartConfig }
        : { type, text: "--Text--", fontSize: "16px" };

    if (type === "function") {
      newComponent.column = selectedColumns;
      newComponent.func = func;
      newComponent.result = result;
    } else if (type === "table") {
      newComponent.selectedColumns = selectedColumns;
      newComponent.highlightSettings = highlightSettings;
      newComponent.highlightColors = highlightColors;
    }

    setComponents([...components, newComponent]);
  };

  useEffect(() => {
    const handleAddComponentEvent = (event) => {
      if (event.detail && event.detail.type) {
        const {
          type,
          selectedColumns,
          highlightSettings,
          highlightColors,
          func,
          result,
          chartConfig,
        } = event.detail;
        handleAddComponent(
          type,
          selectedColumns,
          highlightSettings,
          highlightColors,
          func,
          result,
          chartConfig
        );
      }
    };

    document.addEventListener("addComponent", handleAddComponentEvent);

    return () => {
      document.removeEventListener("addComponent", handleAddComponentEvent);
    };
  }, [components]);

  const handleDelete = (index) => {
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
    setVisibleMenuIndex(null);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newComponents = [...components];
      [newComponents[index - 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index - 1],
      ];
      setComponents(newComponents);
      setVisibleMenuIndex(index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < components.length - 1) {
      const newComponents = [...components];
      [newComponents[index + 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index + 1],
      ];
      setComponents(newComponents);
      setVisibleMenuIndex(index + 1);
    }
  };

  const handleTextChange = (index, newTextObj) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], ...newTextObj };
    setComponents(newComponents);
  };

  return (
    <div className="story-container">
      {components.map((component, index) => {
        switch (component.type) {
          case "function":
            return (
              <Function
                key={index}
                index={index}
                column={component.column}
                func={component.func}
                result={component.result}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
          case "chart":
            return (
              <StoryChart
                key={index}
                index={index}
                chartConfig={component.chartConfig}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
          case "table":
            return (
              <StoryTable
                key={index}
                index={index}
                data={data}
                columnConfigs={columnConfigs}
                selectedColumns={component.selectedColumns}
                highlightSettings={component.highlightSettings}
                highlightColors={component.highlightColors}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
          default:
            return (
              <EditableText
                key={index}
                index={index}
                textObj={component}
                onTextChange={handleTextChange}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
        }
      })}
    </div>
  );
}

export default Story;
