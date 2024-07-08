import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './MenuBar.module.css';

const DataMenu = ({
  columns,
  selectedColumnIndex,
  selectedColumnName,
  handleSort,
  handleFilter,
  tableContainerRef,
  hotRef,
  filteredColumns,
  setFilteredColumns
}) => {
  const [isSortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('');
  const [isFilterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterCondition, setFilterCondition] = useState('none');
  const [filterValue, setFilterValue] = useState('');
  const [allDistinctValues, setAllDistinctValues] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]);
  const [checkedValues, setCheckedValues] = useState([]);
  const [filterSubmenu, setFilterSubmenu] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filterConditionError, setFilterConditionError] = useState('');
  const [filterValueError, setFilterValueError] = useState('');

  // Reference Declarations
  const sortButtonRef = useRef(null);
  const filterButtonRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const conditionButtonRef = useRef(null);
  const valueButtonRef = useRef(null);

  // Close Dropdown if Click Outside
  const handleClickOutside = (event) => {
    if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target) &&
      sortButtonRef.current && !sortButtonRef.current.contains(event.target) &&
      (!tableContainerRef.current || !tableContainerRef.current.contains(event.target))) {
      setSortDropdownVisible(false);
    }
    if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target) &&
      filterButtonRef.current && !filterButtonRef.current.contains(event.target) &&
      (!tableContainerRef.current || !tableContainerRef.current.contains(event.target))) {
      setFilterDropdownVisible(false);
      setFilterSubmenu('');
    }
  };

  // Initialize Event Listeners for 'click outside' detection
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch Distinct Values for selected column
  const fetchDistinctValues = useCallback(() => {
    if (selectedColumnIndex !== null && hotRef.current) {
      const hotInstance = hotRef.current.hotInstance;
      const columnData = hotInstance.getSourceDataAtCol(selectedColumnIndex);
      const uniqueValues = [...new Set(columnData.map(value => (value !== null && value !== undefined ? value : '')))];
      
      const visibleData = hotInstance.getDataAtCol(selectedColumnIndex);
      const visibleUniqueValues = [...new Set(visibleData)];
      
      setAllDistinctValues(uniqueValues);
      setFilteredValues(uniqueValues);
      setCheckedValues(uniqueValues.filter(value => visibleUniqueValues.includes(value)));
    }
  }, [selectedColumnIndex, hotRef]);

  useEffect(() => {
    if (selectedColumnIndex !== null) {
      fetchDistinctValues();
    }
  }, [selectedColumnIndex, selectedColumnName, fetchDistinctValues]);

  // Filter list based on text input
  useEffect(() => {
    if (searchValue === '') {
      setFilteredValues(allDistinctValues);
    } else {
      setFilteredValues(allDistinctValues.filter(value => value.toString().toLowerCase().includes(searchValue.toLowerCase())));
    }
  }, [searchValue, allDistinctValues]);

  // Toggle Dropdown visibility
  const handleMenuClick = (item) => {
    if (item === 'Sort') {
      setSortDropdownVisible(!isSortDropdownVisible);
      setFilterDropdownVisible(false);
    } else if (item === 'Filter') {
      setFilterDropdownVisible(!isFilterDropdownVisible);
      setSortDropdownVisible(false);
      if (!isFilterDropdownVisible) {
        fetchDistinctValues();
      }
    }
  };

  // Handle Sorting Order
  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Apply Sorting
  const handleSortClick = () => {
    handleSort(selectedColumnName, sortOrder);
    setSortOrder('');
    setSortDropdownVisible(false);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Calculate position for sub-dropdowns
  const getSubDropdownPosition = (ref) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return { top: rect.top - 36, left: rect.right - 93 };
    }
    return { top: 0, left: 0 };
  };

  // Handle search input value change
  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Handle Filter Condition Change
  const handleFilterConditionChange = (event) => {
    setFilterCondition(event.target.value);
  };

  // Handle Filter Value Change
  const handleFilterValueChange = (event) => {
    setFilterValue(event.target.value);
  };

  // Apply Filter by Condition
  const handleFilterClick = () => {
    if (selectedColumnIndex === null) {
      setFilterConditionError('Please select a column');
      return;
    }
    setFilterConditionError(''); // Clear error message if a column is selected

    const column = columns[selectedColumnIndex];
    if (!column) return;

    const newCheckedValues = allDistinctValues.filter(value => {
      switch (filterCondition) {
        case 'empty':
          return value === '';
        case 'not_empty':
          return value !== '';
        case 'eq':
          return value === filterValue;
        case 'neq':
          return value !== filterValue;
        case 'begins_with':
          return typeof value === 'string' && value.startsWith(filterValue);
        case 'ends_with':
          return typeof value === 'string' && value.endsWith(filterValue);
        case 'contains':
          return typeof value === 'string' && value.includes(filterValue);
        case 'not_contains':
          return typeof value === 'string' && !value.includes(filterValue);
        default:
          return true;
      }
    });

    setCheckedValues(newCheckedValues);
    handleFilter(selectedColumnIndex, filterCondition, filterValue, newCheckedValues, filteredColumns, setFilteredColumns);
    setFilterDropdownVisible(false);
    setFilterSubmenu('');
  };

  const handleCheckboxChange = (value) => {
    setCheckedValues(prevCheckedValues => {
      const newCheckedValues = prevCheckedValues.includes(value)
        ? prevCheckedValues.filter(v => v !== value)
        : [...prevCheckedValues, value];

      setTimeout(() => { // Ensure the state update happens outside of the render phase
        handleFilter(selectedColumnIndex, 'by_value', '', newCheckedValues, filteredColumns, setFilteredColumns);
      }, 0);

      return newCheckedValues;
    });
  };

  const selectAll = () => {
    setCheckedValues(prevCheckedValues => {
      const newCheckedValues = [...new Set([...prevCheckedValues, ...filteredValues])];
      setTimeout(() => { // Ensure the state update happens outside of the render phase
        handleFilter(selectedColumnIndex, 'by_value', '', newCheckedValues, filteredColumns, setFilteredColumns);
      }, 0);
      return newCheckedValues;
    });
  };

  const clearAll = () => {
    setCheckedValues(prevCheckedValues => {
      const newCheckedValues = prevCheckedValues.filter(value => !filteredValues.includes(value));
      setTimeout(() => { // Ensure the state update happens outside of the render phase
        handleFilter(selectedColumnIndex, 'by_value', '', newCheckedValues, filteredColumns, setFilteredColumns);
      }, 0);
      return newCheckedValues;
    });
  };

  const resetFilter = () => {
    setFilterCondition('none');
    setFilterValue('');
    setCheckedValues(allDistinctValues);
    setTimeout(() => { // Ensure the state update happens outside of the render phase
      handleFilter(selectedColumnIndex, 'none', '', [], filteredColumns, setFilteredColumns);
    }, 0);
  };

  return (
    <>
      {['Sort', 'Filter', 'Column Stats'].map((item, index) => (
        <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
          <button ref={item === 'Sort' ? sortButtonRef : item === 'Filter' ? filterButtonRef : null} className={styles.button}>{item}</button>
          {item === 'Sort' && isSortDropdownVisible && (
            <div
              className={styles.Dropdown}
              style={{ top: sortButtonRef.current?.getBoundingClientRect().bottom, left: sortButtonRef.current?.getBoundingClientRect().left }}
              onClick={stopPropagation}
              ref={sortDropdownRef}
            >
              <div className={styles.textOption}>
                <div>{`selected column: column ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
              </div>
              <div className={`${styles.textOption} ${styles.inputContainer}`}>
                <select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className={styles.input}
                >
                  <option value="" disabled>Select order</option>
                  <option value="Ascending">Ascending</option>
                  <option value="Descending">Descending</option>
                </select>
                <button onClick={handleSortClick} className={styles.applyButton}>
                  Apply
                </button>
              </div>
            </div>
          )}
          {item === 'Filter' && isFilterDropdownVisible && (
            <div
              className={styles.Dropdown}
              style={{ top: filterButtonRef.current?.getBoundingClientRect().bottom, left: filterButtonRef.current?.getBoundingClientRect().left }}
              onClick={stopPropagation}
              ref={filterDropdownRef}
            >
              <div className={styles.textOption}>
                <div>{`selected column: column ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
              </div>
              <div className={styles.textOption} onClick={() => setFilterSubmenu('condition')} ref={conditionButtonRef}>
                Filter by condition
              </div>
              <div className={styles.textOption} onClick={() => setFilterSubmenu('value')} ref={valueButtonRef}>
                Filter by value
              </div>
              <div className={styles.textOption} onClick={resetFilter}>
                Reset filter for this column
              </div>
              {filterSubmenu === 'condition' && (
                <div
                  className={styles.Dropdown}
                  style={{ ...getSubDropdownPosition(conditionButtonRef) }}
                  onClick={stopPropagation}
                >
                  <div className={`${styles.textOption} ${styles.inputContainer}`}>
                    <select
                      value={filterCondition}
                      onChange={handleFilterConditionChange}
                      className={styles.input}
                    >
                      <option value="none">None</option>
                      <option value="empty">Is empty</option>
                      <option value="not_empty">Is not empty</option>
                      <option value="eq">Is equal to</option>
                      <option value="neq">Is not equal to</option>
                      <option value="begins_with">Begins with</option>
                      <option value="ends_with">Ends with</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Does not contain</option>
                    </select>
                    {(filterCondition !== 'none' && filterCondition !== 'empty' && filterCondition !== 'not_empty') && (
                      <input
                        type="text"
                        value={filterValue}
                        onChange={handleFilterValueChange}
                        className={styles.input}
                        placeholder="Value"
                      />
                    )}
                    <button onClick={handleFilterClick} className={styles.applyButton}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
              {filterSubmenu === 'value' && (
                <div
                  className={styles.Dropdown}
                  style={{ ...getSubDropdownPosition(valueButtonRef) }}
                  onClick={stopPropagation}
                >
                  <div className={styles.selectClearAll}>
                    <button onClick={selectAll} className={styles.applyButton}>Check All</button>
                    <button onClick={clearAll} className={styles.applyButton}>Uncheck All</button>
                  </div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={handleSearchValueChange}
                    className={styles.input}
                    placeholder="Search values"
                    style={{ marginBottom: '10px', width: '100%' }}
                  />
                  <div className={styles.distinctValuesList}>
                    <ul>
                      {filteredValues.map((value, index) => (
                        <li key={index}>
                          <input
                            type="checkbox"
                            checked={checkedValues.includes(value)}
                            onChange={() => handleCheckboxChange(value)}
                          />
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
      ))}
    </>
  );
};

export default DataMenu;
