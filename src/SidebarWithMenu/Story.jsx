import React, { useEffect, useState, useRef } from "react";
import EditableText from "./EditableStoryComponents/EditableText";
import Function from "./EditableStoryComponents/Function";
import StoryChart from "./EditableStoryComponents/StoryChart";
import StoryTable from "./EditableStoryComponents/StoryTable";
import StoryMenu from "./StoryMenu/StoryMenu";
import "./Story.css";
import { Card, Form } from "react-bootstrap";
import { transformChartConfig } from "./StoryMenu/ChartMenu"

function Story({
  components,
  setComponents,
  data,
  columnConfigs,
  chartNames,
  chartConfigs,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  selectedRange,
  tableContainerRef,
  hotRef,
}) {
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedRangeState, setSelectedRangeState] = useState(null);
  const cardRef = useRef(null);

  // Hook to update the selected range state based on user selection in the table
  useEffect(() => {
    const hotInstance = hotRef.current?.hotInstance;

    if (hotInstance) {
      hotInstance.addHook("afterSelectionEnd", (r1, c1, r2, c2) => {
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        const allRowsSelected =
          (minCol === 0 && maxCol === hotInstance.countCols() - 1) ||
          minCol === -1;
        const allColsSelected =
          (minRow === 0 && maxRow === hotInstance.countRows() - 1) ||
          minRow === -1;

        setSelectedRangeState({
          minRow: Math.max(minRow, 0),
          maxRow,
          minCol: Math.max(minCol, 0),
          maxCol,
          allRows: allRowsSelected,
          allCols: allColsSelected,
        });
      });
    }

    return () => {
      if (hotInstance && !hotInstance.isDestroyed) {
        hotInstance.removeHook("afterSelectionEnd");
      }
    };
  }, [hotRef]);

  // Hook to close the card when clicking outside, except when clicking on the table
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cardElement = cardRef.current;
      const tableElement = tableContainerRef.current;

      // Check if the click is outside the card and not on the table
      if (
        cardElement &&
        !cardElement.contains(event.target) &&
        tableElement &&
        !tableElement.contains(event.target)
      ) {
        setShowCard(false);
      }
    };

    if (showCard) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCard, tableContainerRef]);

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
      // console.log("116", newComponent, data, shownData);
      newComponent.shownData = JSON.parse(JSON.stringify(data));
      newComponent.selectedColumns = selectedColumns;
      newComponent.highlightSettings = highlightSettings;
      newComponent.highlightColors = highlightColors;
    }

    // console.log("121 @@@@@", newComponent.shownData, data, newComponent);
    setComponents([...components, newComponent]);
    components = [...components, newComponent];
    setShowCard(false); // Close the card after adding the component
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
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
    components = newComponents;
    setComponents(components);
    setVisibleMenuIndex(null);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newComponents = [...components];
      [newComponents[index - 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index - 1],
      ];
      components = newComponents;
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
      components = newComponents;
      setVisibleMenuIndex(index + 1);
    }
  };

  const handleUpdate = (index) => {
    const currentComponent = components[index];
    if (currentComponent.type === "chart") {
      const prevIndex = index;  
      handleDelete(index);
      const matchingChartConfig = chartConfigs.find(chartConfig => chartConfig.title === currentComponent.chartConfig.title);
      const transformedMatchingChartConfig = transformChartConfig(matchingChartConfig);
      handleAddComponent(currentComponent.type, [], [], [], "", "", transformedMatchingChartConfig);
      let newIndex = components.length - 1;
      while (newIndex > prevIndex) {
        handleMoveUp(newIndex);
        newIndex--;
      }
    }
    else if (currentComponent.type === "table") {
      const prevIndex = index;  
      handleDelete(index);
      handleAddComponent(currentComponent.type, 
        currentComponent.selectedColumns, 
        currentComponent.highlightSettings, 
        currentComponent.highlightColors, 
        currentComponent.func, 
        currentComponent.result, 
        currentComponent.chartConfig);
      let newIndex = components.length - 1;
      console.log(newIndex, " ", prevIndex);
        while (newIndex > prevIndex) {
          handleMoveUp(newIndex);
          newIndex--;
        }
    } 
  };

  const handleTextChange = (index, newTextObj) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], ...newTextObj };
    setComponents(newComponents);
    components = newComponents;
  };

  const handleShowCard = () => {
    setShowCard((prevShowCard) => !prevShowCard);
    if (!showCard && selectedOption === "") {
      //setSelectedOption("text");
    }
  };

  useEffect(() => {
    if (showCard && selectedOption === "") {
      //setSelectedOption("text");
    }
  }, [showCard, selectedOption]);

  return (
    <div className="story-container" style={{ position: "relative" }}>
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
                onUpdate={handleUpdate}
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
                onUpdate={handleUpdate}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
          case "table":
            return (
              <StoryTable
                key={index}
                index={index}
                shownData={component.shownData}
                columnConfigs={columnConfigs}
                selectedColumns={component.selectedColumns}
                highlightSettings={component.highlightSettings}
                highlightColors={component.highlightColors}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onUpdate={handleUpdate}
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
                onUpdate={handleUpdate}
                isMenuVisible={visibleMenuIndex === index}
                setVisibleMenuIndex={setVisibleMenuIndex}
              />
            );
        }
      })}

      <div className="d-flex justify-content-start mt-3">
        <button
          className="btn btn-secondary btn-circle"
          onClick={handleShowCard}
          style={{ paddingBottom: "4px", paddingLeft: "11px" }}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {showCard && (
        <Card className="story-card custom-card-background" ref={cardRef}>
          <Card.Body>
            <Form>
              <Form.Group controlId="componentSelect">
                <select
                  id="chartType"
                  value={selectedOption}
                  onChange={handleOptionChange}
                  className="form-select"
                >
                  <option value="">Select element type</option>
                  <option value="text">Text</option>
                  <option value="function">Function</option>
                  <option value="chart">Chart</option>
                  <option value="table">Table</option>
                </select>
              </Form.Group>
            </Form>

            <StoryMenu
              selectedOption={selectedOption}
              handleAddComponent={handleAddComponent}
              selectedRangeState={selectedRangeState}
              columnConfigs={columnConfigs}
              tableContainerRef={tableContainerRef}
              hotRef={hotRef}
              setShowConfirmation={setShowConfirmation}
              setConfirmationMessage={setConfirmationMessage}
              setOnConfirmAction={setOnConfirmAction}
              setOnCancelAction={setOnCancelAction}
              chartNames={chartNames}
              chartConfigs={chartConfigs}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default Story;
