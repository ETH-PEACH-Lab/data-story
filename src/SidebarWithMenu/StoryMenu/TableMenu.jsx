import React, { useMemo, useState, useEffect } from "react";
import { Button, Form, Card, Accordion } from "react-bootstrap";
import { CirclePicker } from "react-color";

const TableMenu = ({
  columnConfigs,
  selectedColumns,
  setSelectedColumns,
  addComponent,
}) => {
  const [highlightColors, setHighlightColors] = useState([
    "#0AEFFF",
    "#FF8700",
  ]);
  const [colorPickerVisible, setColorPickerVisible] = useState([false, false]);

  const originalColors = [
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

  function tintColor(color, percentage) {
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

  const tintedColors = originalColors.map((color) => tintColor(color, 60));
  const allColors = [...originalColors, ...tintedColors];

  const initialHighlightSettings = {
    selectedColumns: [],
    isEnabled: false,
    condition: "no condition",
    value: "",
    columnSelection: "of all columns",
    rowSelection: "of all rows",
    rowRange: "",
  };

  const [highlightSettings, setHighlightSettings] = useState([
    { ...initialHighlightSettings },
    { ...initialHighlightSettings },
  ]);

  const handleHighlightCheckboxChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, isEnabled: e.target.checked } : settings
      )
    );
  };

  const handleHighlightConditionChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, condition: e.target.value } : settings
      )
    );
  };

  const handleHighlightValueChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, value: e.target.value } : settings
      )
    );
  };

  const handleRowRangeChange = (index) => (e) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index ? { ...settings, rowRange: e.target.value } : settings
      )
    );
  };

  const handleHighlightColumnSelect = (index, column) => {
    setHighlightSettings((prev) =>
      prev.map((settings, i) =>
        i === index
          ? {
              ...settings,
              selectedColumns: settings.selectedColumns.includes(column)
                ? settings.selectedColumns.filter((col) => col !== column)
                : [...settings.selectedColumns, column],
            }
          : settings
      )
    );
  };

  const handleColorChangeComplete = (index) => (color) => {
    setHighlightColors((prev) =>
      prev.map((col, i) => (i === index ? color.hex : col))
    );
    setColorPickerVisible((prev) =>
      prev.map((visible, i) => (i === index ? false : visible))
    );
  };

  const handleColumnSelect = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const allColumnsSelected = useMemo(
    () => selectedColumns.length === columnConfigs.length,
    [selectedColumns, columnConfigs]
  );

  const selectAllColumns = () =>
    setSelectedColumns(columnConfigs.map((column) => column.title));

  const resetHighlightSettings = (
    setHighlightSettings,
    setHighlightColor,
    initialColor
  ) => {
    setHighlightSettings({
      selectedColumns: [],
      isEnabled: false,
      condition: "no condition",
      value: "",
      columnSelection: "of all columns",
      rowSelection: "of all rows",
      rowRange: "",
    });
    setHighlightColor(tintColor(initialColor, 60));
  };

  const handleInsertComponent = (componentType) => {
    addComponent(
      componentType,
      selectedColumns,
      highlightSettings,
      highlightColors
    );

    // Reset selection to all columns after insertion
    selectAllColumns();
    resetHighlightSettings(
      (settings) =>
        setHighlightSettings((prev) =>
          prev.map((s, i) => (i === 0 ? settings : s))
        ),
      (color) =>
        setHighlightColors((prev) => prev.map((c, i) => (i === 0 ? color : c))),
      "#0AEFFF"
    );
    resetHighlightSettings(
      (settings) =>
        setHighlightSettings((prev) =>
          prev.map((s, i) => (i === 1 ? settings : s))
        ),
      (color) =>
        setHighlightColors((prev) => prev.map((c, i) => (i === 1 ? color : c))),
      "#FF8700"
    );
  };

  const HighlightAccordionContent = ({
    index,
    highlightSettings,
    setHighlightSettings,
    highlightColor,
    setHighlightColor,
    colorPickerVisible,
    setColorPickerVisible,
    allColors,
  }) => (
    <Accordion.Item eventKey={`highlight-${index}`}>
      <Accordion.Header>{`Highlight ${index + 1}`}</Accordion.Header>
      <Accordion.Body>
        <Form.Check
          type="checkbox"
          checked={highlightSettings.isEnabled}
          onChange={handleHighlightCheckboxChange(index)}
          label="Enable Highlight"
        />
        <div
          onClick={() =>
            setColorPickerVisible((prev) =>
              prev.map((visible, i) => (i === index ? !visible : visible))
            )
          }
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: highlightColor,
            marginLeft: "10px",
            cursor: "pointer",
            border: "1px solid #000",
          }}
        />
        {colorPickerVisible[index] && (
          <div style={{ position: "relative", zIndex: 2 }}>
            <CirclePicker
              color={highlightColor}
              colors={allColors}
              onChangeComplete={handleColorChangeComplete(index)}
            />
          </div>
        )}
        {highlightSettings.isEnabled && (
          <>
            <Form.Group controlId="columnSelection">
              <Form.Label>Column Selection</Form.Label>
              <Form.Control
                as="select"
                value={highlightSettings.columnSelection}
                onChange={(e) =>
                  setHighlightSettings((prev) =>
                    prev.map((settings, i) =>
                      i === index
                        ? { ...settings, columnSelection: e.target.value }
                        : settings
                    )
                  )
                }
              >
                <option value="of all columns">of all columns</option>
                <option value="of selected columns">of selected columns</option>
              </Form.Control>
              {highlightSettings.columnSelection === "of selected columns" && (
                <>
                  <Form.Label>Select Columns</Form.Label>
                  {columnConfigs.map((column, i) => (
                    <Form.Check
                      key={i}
                      type="checkbox"
                      checked={highlightSettings.selectedColumns.includes(
                        column.title
                      )}
                      onChange={() =>
                        handleHighlightColumnSelect(index, column.title)
                      }
                      label={column.title}
                    />
                  ))}
                </>
              )}
            </Form.Group>
            <Form.Group controlId="rowSelection">
              <Form.Label>Row Selection</Form.Label>
              <Form.Control
                as="select"
                value={highlightSettings.rowSelection}
                onChange={(e) =>
                  setHighlightSettings((prev) =>
                    prev.map((settings, i) =>
                      i === index
                        ? { ...settings, rowSelection: e.target.value }
                        : settings
                    )
                  )
                }
              >
                <option value="of all rows">of all rows</option>
                <option value="of range of rows">of range of rows</option>
              </Form.Control>
              {highlightSettings.rowSelection === "of range of rows" && (
                <Form.Control
                  type="text"
                  placeholder="e.g., 1-5"
                  value={highlightSettings.rowRange}
                  onChange={handleRowRangeChange(index)}
                  className={styles.inputField}
                />
              )}
            </Form.Group>
            <Form.Group controlId="condition">
              <Form.Label>Condition</Form.Label>
              <Form.Control
                as="select"
                value={highlightSettings.condition}
                onChange={handleHighlightConditionChange(index)}
              >
                <option value="no condition">no condition</option>
                <option value="empty">empty</option>
                <option value="not empty">not empty</option>
                <option value="is equal">is equal</option>
                <option value="is not equal">is not equal</option>
                <option value="is bigger than">is bigger than</option>
                <option value="is bigger than or equal">
                  is bigger than or equal
                </option>
                <option value="is less than">is less than</option>
                <option value="is less than or equal">
                  is less than or equal
                </option>
                <option value="begins with">begins with</option>
                <option value="ends with">ends with</option>
                <option value="contains">contains</option>
                <option value="does not contain">does not contain</option>
              </Form.Control>
              {[
                "is equal",
                "is not equal",
                "begins with",
                "ends with",
                "contains",
                "does not contain",
                "is bigger than",
                "is bigger than or equal",
                "is less than",
                "is less than or equal",
              ].includes(highlightSettings.condition) && (
                <Form.Control
                  type="text"
                  value={highlightSettings.value}
                  onChange={handleHighlightValueChange(index)}
                  className={styles.inputField}
                />
              )}
            </Form.Group>
          </>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );

  return (
    <Card className="mb-3">
      <Card.Body>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              {allColumnsSelected ? "All columns" : "Selected Columns"}
            </Accordion.Header>
            <Accordion.Body>
              {columnConfigs.map((column, index) => (
                <div key={index}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedColumns.includes(column.title)}
                    onChange={() => handleColumnSelect(column.title)}
                    label={column.title}
                  />
                </div>
              ))}
            </Accordion.Body>
          </Accordion.Item>
          {[0, 1].map((i) => (
            <HighlightAccordionContent
              key={i}
              index={i}
              highlightSettings={highlightSettings[i]}
              setHighlightSettings={setHighlightSettings}
              highlightColor={highlightColors[i]}
              setHighlightColor={setHighlightColors}
              colorPickerVisible={colorPickerVisible}
              setColorPickerVisible={setColorPickerVisible}
              allColors={allColors}
            />
          ))}
        </Accordion>
        <div className="mt-3">
          <Button
            onClick={() => handleInsertComponent("table")}
            variant="secondary"
          >
            Insert
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TableMenu;
