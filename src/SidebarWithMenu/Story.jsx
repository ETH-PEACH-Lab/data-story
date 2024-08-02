import React, { useEffect, useState } from "react";
import EditableText from "./EditableStoryComponents/EditableText";
import Function from "./EditableStoryComponents/Function";
import StoryChart from "./EditableStoryComponents/StoryChart";
import StoryTable from "./EditableStoryComponents/StoryTable"; // Import the StoryTable component
import "./Story.css";

function Story({ components, setComponents, data, columnConfigs }) {
  // Add data and columnConfigs as props
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);

  const handleTextChange = (index, newTextObj) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], ...newTextObj };
    setComponents(newComponents);
  };

  const handleAddComponent = (
    type,
    selectedColumns = [],
    func = "",
    result = ""
  ) => {
    console.log("handleAddComponent called with:", {
      type,
      selectedColumns,
      func,
      result,
    });
    const newComponent =
      type === "function"
        ? { type, column: selectedColumns, func, result }
        : type === "chart"
        ? { type }
        : type === "table"
        ? { type, selectedColumns } // Pass selectedColumns here
        : { type, text: "--Text--", fontSize: "16px" };
    setComponents([...components, newComponent]);
  };

  useEffect(() => {
    const handleAddComponentEvent = (event) => {
      if (event.detail && event.detail.type) {
        const { type, selectedColumns, func, result } = event.detail;
        console.log("Event detail received in Story:", {
          type,
          selectedColumns,
          func,
          result,
        });
        handleAddComponent(type, selectedColumns, func, result);
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
                data={data} // Pass data
                columnConfigs={columnConfigs} // Pass columnConfigs
                selectedColumns={component.selectedColumns} // Pass selectedColumns
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
