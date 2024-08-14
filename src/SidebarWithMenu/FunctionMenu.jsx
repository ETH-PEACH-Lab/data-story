import React, { useState } from "react";
import { Button, Form, Card } from "react-bootstrap"; // Imported Bootstrap components

const FunctionMenu = ({
  selectedRangeState,
  getSelectedCellsData,
  setSelectedFunction,
  selectedFunction,
  setShowConfirmation,
  setConfirmationMessage,
  addComponent,
}) => {
  const [localSelectedFunction, setLocalSelectedFunction] =
    useState(selectedFunction);

  const calculateFunctionResult = (func, data) => {
    if (!data || data.length === 0) return { result: "No data", warning: "" };

    const convertedData = data.map((row) =>
      row.map((cell) =>
        cell !== null && cell !== undefined && typeof cell === "string"
          ? cell.replace(",", ".")
          : cell
      )
    );

    const numbers = convertedData.map((row) =>
      row
        .map((cell) =>
          cell !== null && cell !== undefined ? parseFloat(cell) : NaN
        )
        .filter((val) => !isNaN(val))
    );
    const flatNumbers = [].concat(...numbers);

    const hasNonNumericValues = data
      .flat()
      .some(
        (cell) =>
          cell !== null &&
          cell !== undefined &&
          isNaN(parseFloat(cell.toString().replace(",", ".")))
      );

    let result;
    let warning = "";
    switch (func) {
      case "AVERAGE":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = (
          flatNumbers.reduce((acc, num) => acc + num, 0) / flatNumbers.length
        ).toFixed(2);
        break;
      case "SUM":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = flatNumbers.reduce((acc, num) => acc + num, 0).toFixed(2);
        break;
      case "MAX":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = Math.max(...flatNumbers).toFixed(2);
        break;
      case "MIN":
        if (flatNumbers.length === 0)
          return {
            result: "No numeric data",
            warning: hasNonNumericValues
              ? "Warning: Some selected cells do not contain numeric data."
              : "",
          };
        result = Math.min(...flatNumbers).toFixed(2);
        break;
      case "COUNT":
        result = data.flat().length;
        break;
      case "COUNT EMPTY":
        result = data.reduce(
          (acc, row) =>
            acc +
            row.filter(
              (cell) => cell === "" || cell === null || cell === undefined
            ).length,
          0
        );
        break;
      case "COUNT UNIQUE":
        const uniqueValues = new Set(data.flat().filter((cell) => cell !== ""));
        result = uniqueValues.size;
        break;
      default:
        result = "Unknown function";
    }

    if (
      hasNonNumericValues &&
      ["AVERAGE", "SUM", "MAX", "MIN"].includes(func)
    ) {
      warning = "Warning: This function requires numerical values only.";
    }

    return { result, warning };
  };

  const generateRangeString = () => {
    if (!selectedRangeState) return "No range selected";

    if (selectedRangeState.allCols) {
      const colWord =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? "Column"
          : "Columns";
      const colRange =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? `${selectedRangeState.minCol + 1}`
          : `${selectedRangeState.minCol + 1}-${selectedRangeState.maxCol + 1}`;
      return `${colWord}: ${colRange}`;
    } else if (selectedRangeState.allRows) {
      const rowWord =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? "Row"
          : "Rows";
      const rowRange =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? `${selectedRangeState.minRow + 1}`
          : `${selectedRangeState.minRow + 1}-${selectedRangeState.maxRow + 1}`;
      return `${rowWord}: ${rowRange}`;
    } else {
      const rowWord =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? "Row"
          : "Rows";
      const colWord =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? "Column"
          : "Columns";
      const rowRange =
        selectedRangeState.minRow === selectedRangeState.maxRow
          ? `${selectedRangeState.minRow + 1}`
          : `${selectedRangeState.minRow + 1}-${selectedRangeState.maxRow + 1}`;
      const colRange =
        selectedRangeState.minCol === selectedRangeState.maxCol
          ? `${selectedRangeState.minCol + 1}`
          : `${selectedRangeState.minCol + 1}-${selectedRangeState.maxCol + 1}`;
      return `${rowWord}: ${rowRange}, ${colWord}: ${colRange}`;
    }
  };

  const handleFunctionApply = () => {
    const rangeString = generateRangeString();
    const selectedData = getSelectedCellsData();
    const { result, warning } = calculateFunctionResult(
      localSelectedFunction,
      selectedData
    );

    if (warning) {
      setConfirmationMessage(warning);
      setShowConfirmation(true);
    } else {
      addComponent(
        "function",
        [rangeString], // Pass selectedColumns as an array
        [], // Empty highlightSettings
        [], // Empty highlightColors
        localSelectedFunction,
        result
      );
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Text className="mb-2">
          <strong>Selected Range:</strong> {generateRangeString()}
        </Card.Text>

        <Form.Group controlId="functionSelect" className="mb-3">
          <Form.Control
            as="select"
            value={localSelectedFunction}
            onChange={(e) => setLocalSelectedFunction(e.target.value)}
          >
            <option value="" disabled>
              Select a function
            </option>
            {[
              "AVERAGE",
              "SUM",
              "MAX",
              "MIN",
              "COUNT",
              "COUNT EMPTY",
              "COUNT UNIQUE",
            ].map((func, index) => (
              <option key={index} value={func}>
                {func}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Button
          onClick={handleFunctionApply}
          variant="secondary"
          disabled={!selectedRangeState || !localSelectedFunction}
        >
          Insert
        </Button>
      </Card.Body>
    </Card>
  );
};

export default FunctionMenu;
