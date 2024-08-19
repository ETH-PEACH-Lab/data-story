import React, { useState, useRef, useEffect, useCallback } from "react";

const DataMenu = ({
  columns,
  selectedColumnIndex,
  selectedColumnName,
  handleSort,
  handleFilter,
  tableContainerRef,
  hotRef,
  filteredColumns,
  setFilteredColumns,
}) => {
  const [activeItem, setActiveItem] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [filterCondition, setFilterCondition] = useState("none");
  const [filterValue, setFilterValue] = useState("");
  const [allDistinctValues, setAllDistinctValues] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]);
  const [checkedValues, setCheckedValues] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterConditionError, setFilterConditionError] = useState("");
  const [accordionState, setAccordionState] = useState({
    condition: false,
    value: false,
  });

  const sortButtonRef = useRef(null);
  const filterButtonRef = useRef(null);
  const accordionRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      activeItem !== "" &&
      accordionRef.current &&
      !accordionRef.current.contains(event.target) &&
      !sortButtonRef.current.contains(event.target) &&
      !filterButtonRef.current.contains(event.target) &&
      !tableContainerRef.current.contains(event.target)
    ) {
      setActiveItem("");
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeItem]);

  const fetchDistinctValues = useCallback(() => {
    if (selectedColumnIndex !== null && hotRef.current) {
      const hotInstance = hotRef.current.hotInstance;
      const columnData = hotInstance.getSourceDataAtCol(selectedColumnIndex);
      const uniqueValues = [
        ...new Set(
          columnData.map((value) =>
            value !== null && value !== undefined ? value : ""
          )
        ),
      ];

      const visibleData = hotInstance.getDataAtCol(selectedColumnIndex);
      const visibleUniqueValues = [...new Set(visibleData)];

      setAllDistinctValues(uniqueValues);
      setFilteredValues(uniqueValues);
      setCheckedValues(
        uniqueValues.filter((value) => visibleUniqueValues.includes(value))
      );
    }
  }, [selectedColumnIndex, hotRef]);

  useEffect(() => {
    if (selectedColumnIndex !== null) {
      fetchDistinctValues();
    }
  }, [selectedColumnIndex, selectedColumnName, fetchDistinctValues]);

  useEffect(() => {
    if (searchValue === "") {
      setFilteredValues(allDistinctValues);
    } else {
      setFilteredValues(
        allDistinctValues.filter((value) =>
          value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [searchValue, allDistinctValues]);

  const handleMenuClick = (item) => {
    if (item === activeItem) {
      setActiveItem("");
    } else {
      setActiveItem(item);
      if (item === "Filter") {
        fetchDistinctValues();
      }
    }
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleSortClick = () => {
    handleSort(selectedColumnName, sortOrder, columns, hotRef);
    setSortOrder("");
    setActiveItem("");
  };

  const handleResetSortClick = () => {
    handleSort(selectedColumnName, "reset", columns, hotRef);
    setSortOrder("");
    setActiveItem("");
  };

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleFilterConditionChange = (event) => {
    setFilterCondition(event.target.value);
  };

  const handleFilterValueChange = (event) => {
    setFilterValue(event.target.value);
  };

  const handleFilterClick = () => {
    if (selectedColumnIndex === null) {
      setFilterConditionError("Please select a column");
      return;
    }
    setFilterConditionError("");

    const column = columns[selectedColumnIndex];
    if (!column) return;

    const newCheckedValues = allDistinctValues.filter((value) => {
      switch (filterCondition) {
        case "empty":
          return value === "";
        case "not_empty":
          return value !== "";
        case "eq":
          return value === filterValue;
        case "neq":
          return value !== filterValue;
        case "begins_with":
          return typeof value === "string" && value.startsWith(filterValue);
        case "ends_with":
          return typeof value === "string" && value.endsWith(filterValue);
        case "contains":
          return typeof value === "string" && value.includes(filterValue);
        case "not_contains":
          return typeof value === "string" && !value.includes(filterValue);
        case "lt":
          return value < filterValue;
        case "gt":
          return value > filterValue;
        case "lte":
          return value <= filterValue;
        case "gte":
          return value >= filterValue;
        default:
          return true;
      }
    });

    setCheckedValues(newCheckedValues);
    handleFilter(
      selectedColumnIndex,
      filterCondition,
      filterValue,
      newCheckedValues,
      filteredColumns,
      setFilteredColumns
    );
    setActiveItem("");
  };

  const handleCheckboxChange = (value) => {
    setCheckedValues((prevCheckedValues) => {
      const newCheckedValues = prevCheckedValues.includes(value)
        ? prevCheckedValues.filter((v) => v !== value)
        : [...prevCheckedValues, value];

      setTimeout(() => {
        handleFilter(
          selectedColumnIndex,
          "by_value",
          "",
          newCheckedValues,
          filteredColumns,
          setFilteredColumns
        );
      }, 0);

      return newCheckedValues;
    });
  };

  const selectAll = () => {
    setCheckedValues((prevCheckedValues) => {
      const newCheckedValues = [
        ...new Set([...prevCheckedValues, ...filteredValues]),
      ];
      setTimeout(() => {
        handleFilter(
          selectedColumnIndex,
          "by_value",
          "",
          newCheckedValues,
          filteredColumns,
          setFilteredColumns
        );
      }, 0);
      return newCheckedValues;
    });
  };

  const clearAll = () => {
    setCheckedValues((prevCheckedValues) => {
      const newCheckedValues = prevCheckedValues.filter(
        (value) => !filteredValues.includes(value)
      );
      setTimeout(() => {
        handleFilter(
          selectedColumnIndex,
          "by_value",
          "",
          newCheckedValues,
          filteredColumns,
          setFilteredColumns
        );
      }, 0);
      return newCheckedValues;
    });
  };

  const resetFilter = () => {
    setFilterCondition("none");
    setFilterValue("");
    setCheckedValues(allDistinctValues);
    setTimeout(() => {
      handleFilter(
        selectedColumnIndex,
        "none",
        "",
        [],
        filteredColumns,
        setFilteredColumns
      );
    }, 0);
    setActiveItem("");
  };

  const toggleAccordion = (section) => {
    setAccordionState((prevState) => ({
      condition: section === "condition" ? !prevState.condition : false,
      value: section === "value" ? !prevState.value : false,
    }));
  };

  const activeButtonColor = {
    backgroundColor: "var(--secondary)",
    color: "white",
  };

  return (
    <div>
      <div
        className="d-flex gap-2"
        style={{ width: "400px", marginBottom: "-8px" }}
      >
        {["Sort", "Filter"].map((item, index) => (
          <button
            key={index}
            className="btn btn-outline-secondary"
            onClick={() => handleMenuClick(item)}
            style={activeItem === item ? activeButtonColor : {}}
            ref={
              item === "Sort"
                ? sortButtonRef
                : item === "Filter"
                ? filterButtonRef
                : null
            }
          >
            {item === "Sort" && (
              <i
                className="bi bi-arrow-down-up"
                style={{ marginRight: "5px" }}
              ></i>
            )}
            {item === "Filter" && (
              <i className="bi bi-funnel" style={{ marginRight: "5px" }}></i>
            )}
            {item}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <div className={`collapse ${activeItem === "Sort" ? "show" : ""}`}>
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "16px" }}
          >
            <div className="mb-2">
              {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                "No column selected"}
            </div>
            <div className="d-flex gap-2">
              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="form-control"
              >
                <option value="" disabled>
                  Select order
                </option>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
              <button onClick={handleSortClick} className="btn btn-secondary">
                Apply
              </button>
            </div>
            <button
              onClick={handleResetSortClick}
              className="btn btn-secondary mt-2"
              style={{ width: "145px" }}
            >
              Reset all sorting
            </button>
          </div>
        </div>

        <div
          className={`collapse ${activeItem === "Filter" ? "show" : ""}`}
          ref={accordionRef}
        >
          <div
            className="card card-body"
            style={{ width: "400px", marginTop: "16px" }}
          >
            <div className="mb-2">
              {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                "No column selected"}
            </div>
            <div className="accordion" id="filterAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingCondition">
                  <button
                    className={`accordion-button ${
                      accordionState.condition ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={() => toggleAccordion("condition")}
                    aria-expanded={accordionState.condition}
                    aria-controls="collapseCondition"
                  >
                    Filter by Condition
                  </button>
                </h2>
                <div
                  id="collapseCondition"
                  className={`accordion-collapse collapse ${
                    accordionState.condition ? "show" : ""
                  }`}
                  aria-labelledby="headingCondition"
                  data-bs-parent="#filterAccordion"
                >
                  <div className="accordion-body">
                    <div className="d-flex gap-2">
                      <select
                        value={filterCondition}
                        onChange={handleFilterConditionChange}
                        className="form-control"
                      >
                        <option value="none">None</option>
                        <option value="empty">Is empty</option>
                        <option value="not_empty">Is not empty</option>
                        <option value="eq">Is equal to</option>
                        <option value="neq">Is not equal to</option>
                        <option value="lt">Less than</option>
                        <option value="gt">Greater than</option>
                        <option value="lte">Less than or equal</option>
                        <option value="gte">Greater than or equal</option>
                        <option value="begins_with">Begins with</option>
                        <option value="ends_with">Ends with</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Does not contain</option>
                      </select>
                      {filterCondition !== "none" &&
                        filterCondition !== "empty" &&
                        filterCondition !== "not_empty" && (
                          <input
                            type="text"
                            value={filterValue}
                            onChange={handleFilterValueChange}
                            className="form-control"
                            placeholder="Value"
                            style={{ width: "100px" }}
                          />
                        )}
                      <button
                        onClick={handleFilterClick}
                        className="btn btn-secondary"
                        style={{ width: "80px" }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingValue">
                  <button
                    className={`accordion-button ${
                      accordionState.value ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={() => toggleAccordion("value")}
                    aria-expanded={accordionState.value}
                    aria-controls="collapseValue"
                  >
                    Filter by Value
                  </button>
                </h2>
                <div
                  id="collapseValue"
                  className={`accordion-collapse collapse ${
                    accordionState.value ? "show" : ""
                  }`}
                  aria-labelledby="headingValue"
                  data-bs-parent="#filterAccordion"
                >
                  <div className="accordion-body">
                    <div className="d-flex justify-content-between">
                      <button onClick={selectAll} className="btn btn-secondary">
                        Check All
                      </button>
                      <button onClick={clearAll} className="btn btn-secondary">
                        Uncheck All
                      </button>
                    </div>
                    <input
                      type="text"
                      value={searchValue}
                      onChange={handleSearchValueChange}
                      className="form-control my-2"
                      placeholder="Search values"
                    />
                    <div style={{ maxHeight: "165px", overflowY: "auto" }}>
                      <ul className="list-unstyled">
                        {filteredValues.map((value, index) => (
                          <li key={index}>
                            <input
                              type="checkbox"
                              checked={checkedValues.includes(value)}
                              onChange={() => handleCheckboxChange(value)}
                            />{" "}
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={resetFilter}
              className="btn btn-secondary mt-2"
              style={{ width: "220px" }}
            >
              Reset filter for this column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMenu;
