import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./MenuBar.module.css";

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
  const [isSortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [isFilterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterCondition, setFilterCondition] = useState("none");
  const [filterValue, setFilterValue] = useState("");
  const [allDistinctValues, setAllDistinctValues] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]);
  const [checkedValues, setCheckedValues] = useState([]);
  const [filterSubmenu, setFilterSubmenu] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filterConditionError, setFilterConditionError] = useState("");

  const sortButtonRef = useRef(null);
  const filterButtonRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const conditionButtonRef = useRef(null);
  const valueButtonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      sortDropdownRef.current &&
      !sortDropdownRef.current.contains(event.target) &&
      sortButtonRef.current &&
      !sortButtonRef.current.contains(event.target) &&
      (!tableContainerRef.current ||
        !tableContainerRef.current.contains(event.target))
    ) {
      setSortDropdownVisible(false);
    }
    if (
      filterDropdownRef.current &&
      !filterDropdownRef.current.contains(event.target) &&
      filterButtonRef.current &&
      !filterButtonRef.current.contains(event.target) &&
      (!tableContainerRef.current ||
        !tableContainerRef.current.contains(event.target))
    ) {
      setFilterDropdownVisible(false);
      setFilterSubmenu("");
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    if (item === "Sort") {
      setSortDropdownVisible(!isSortDropdownVisible);
      setFilterDropdownVisible(false);
    } else if (item === "Filter") {
      setFilterDropdownVisible(!isFilterDropdownVisible);
      setSortDropdownVisible(false);
      if (!isFilterDropdownVisible) {
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
    setSortDropdownVisible(false);
  };

  const handleResetSortClick = () => {
    handleSort(selectedColumnName, "reset", columns, hotRef);
    setSortOrder("");
    setSortDropdownVisible(false);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const getSubDropdownPosition = (ref) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return { top: rect.top - 180, left: rect.right - 94 };
    }
    return { top: 0, left: 0 };
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
    setFilterDropdownVisible(false);
    setFilterSubmenu("");
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
  };

  return (
    <div className="d-flex gap-2">
      {["Sort", "Filter"].map((item, index) => (
        <button
          key={index}
          className="btn btn-outline-secondary"
          onClick={() => handleMenuClick(item)}
          ref={
            item === "Sort"
              ? sortButtonRef
              : item === "Filter"
              ? filterButtonRef
              : null
          }
        >
          {item}
        </button>
      ))}

      {isSortDropdownVisible && (
        <div
          className="dropdown-menu show"
          style={{
            top: `${
              sortButtonRef.current?.getBoundingClientRect().bottom +
              window.scrollY -
              68
            }px`,
            left: `${
              sortButtonRef.current?.getBoundingClientRect().left +
              window.scrollX -
              23
            }px`,
            position: "absolute",
          }}
          onClick={stopPropagation}
          ref={sortDropdownRef}
        >
          <div className="dropdown-item">
            <div>
              {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                "No column selected"}
            </div>
          </div>
          <div className="dropdown-item d-flex">
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
            <button onClick={handleSortClick} className="btn btn-primary ms-2">
              Apply
            </button>
          </div>
          <div className="dropdown-item" onClick={handleResetSortClick}>
            Reset all sorting
          </div>
        </div>
      )}

      {isFilterDropdownVisible && (
        <div
          className="dropdown-menu show"
          style={{
            top: `${
              filterButtonRef.current?.getBoundingClientRect().bottom +
              window.scrollY -
              68
            }px`,
            left: `${
              filterButtonRef.current?.getBoundingClientRect().left +
              window.scrollX -
              23
            }px`,
            position: "absolute",
          }}
          onClick={stopPropagation}
          ref={filterDropdownRef}
        >
          <div className="dropdown-item">
            <div>
              {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                "No column selected"}
            </div>
          </div>
          <div
            className="dropdown-item"
            onClick={() => setFilterSubmenu("condition")}
            ref={conditionButtonRef}
          >
            Filter by condition
          </div>
          <div
            className="dropdown-item"
            onClick={() => setFilterSubmenu("value")}
            ref={valueButtonRef}
          >
            Filter by value
          </div>
          <div className="dropdown-item" onClick={resetFilter}>
            Reset filter for this column
          </div>

          {filterSubmenu === "condition" && (
            <div
              className="dropdown-menu show"
              style={{ ...getSubDropdownPosition(conditionButtonRef) }}
              onClick={stopPropagation}
            >
              <div className="dropdown-item d-flex">
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
                      className="form-control ms-2"
                      placeholder="Value"
                    />
                  )}
                <button
                  onClick={handleFilterClick}
                  className="btn btn-primary ms-2"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {filterSubmenu === "value" && (
            <div
              className="dropdown-menu show"
              style={{ ...getSubDropdownPosition(valueButtonRef) }}
              onClick={stopPropagation}
            >
              <div className="d-flex justify-content-between">
                <button onClick={selectAll} className="btn btn-secondary">
                  Check All
                </button>
                <button onClick={clearAll} className="btn btn-secondary ms-2">
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
          )}
        </div>
      )}
    </div>
  );
};

export default DataMenu;
