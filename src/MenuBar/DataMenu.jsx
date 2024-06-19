import { useState, useRef, useEffect } from 'react';
import styles from './MenuBar.module.css';

const DataMenu = ({ columns, selectedColumnIndex, selectedColumnName, handleSort, handleFilter, tableContainerRef }) => {
    const [isSortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const [isFilterDropdownVisible, setFilterDropdownVisible] = useState(false);
    const [filterCondition, setFilterCondition] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const sortButtonRef = useRef(null);
    const filterButtonRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const filterDropdownRef = useRef(null);
  
    const handleMenuClick = (item) => {
      if (item === 'Sort') {
        setSortDropdownVisible(!isSortDropdownVisible);
        setFilterDropdownVisible(false); // Close filter dropdown if open
      } else if (item === 'Filter') {
        setFilterDropdownVisible(!isFilterDropdownVisible);
        setSortDropdownVisible(false); // Close sort dropdown if open
      } else {
        console.log(`${item} clicked`);
      }
    };
  
    const handleSortOrderChange = (event) => {
      setSortOrder(event.target.value);
    };
  
    const handleSortClick = () => {
      handleSort(selectedColumnName, sortOrder);
      setSortOrder(''); // Reset sortOrder after applying
      setSortDropdownVisible(false); // Hide the dropdown after applying
    };
  
    const handleFilterConditionChange = (event) => {
      setFilterCondition(event.target.value);
    };
  
    const handleFilterValueChange = (event) => {
      setFilterValue(event.target.value);
    };
  
    const handleFilterClick = () => {
      handleFilter(selectedColumnName, filterCondition, filterValue);
      setFilterCondition(''); // Reset filterCondition after applying
      setFilterValue(''); // Reset filterValue after applying
      setFilterDropdownVisible(false); // Hide the dropdown after applying
    };
  
    const handleClearFilterClick = () => {
      handleFilter(selectedColumnName, 'clear');
      setFilterCondition(''); // Reset filterCondition after clearing
      setFilterValue(''); // Reset filterValue after clearing
      setFilterDropdownVisible(false); // Hide the dropdown after clearing
    };
  
    const stopPropagation = (e) => {
      e.stopPropagation();
    };
  
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current && !sortDropdownRef.current.contains(event.target) &&
        sortButtonRef.current && !sortButtonRef.current.contains(event.target) &&
        (!tableContainerRef.current || !tableContainerRef.current.contains(event.target)) // Add this check
      ) {
        setSortDropdownVisible(false);
      }
      if (
        filterDropdownRef.current && !filterDropdownRef.current.contains(event.target) &&
        filterButtonRef.current && !filterButtonRef.current.contains(event.target) &&
        (!tableContainerRef.current || !tableContainerRef.current.contains(event.target)) // Add this check
      ) {
        setFilterDropdownVisible(false);
      }
    };
  
    useEffect(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, []);
  
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
                  <div>{`selected column: index ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
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
                  <div>{`selected column: index ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
                </div>
                <div className={styles.textOption}>
                  <select
                    value={filterCondition}
                    onChange={handleFilterConditionChange}
                    className={styles.input}
                  >
                    <option value="" disabled>Select condition</option>
                    <option value="empty">Is empty</option>
                    <option value="not_empty">Is not empty</option>
                    <option value="eq">Is equal to</option>
                    <option value="neq">Is not equal to</option>
                    <option value="begins_with">Begins with</option>
                    <option value="ends_with">Ends with</option>
                    <option value="contains">Contains</option>
                    <option value="not_contains">Does not contain</option>
                  </select>
                  {(filterCondition === 'eq' || filterCondition === 'neq' || filterCondition === 'begins_with' || filterCondition === 'ends_with' || filterCondition === 'contains' || filterCondition === 'not_contains') && (
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
                <div className={styles.clearButtonContainer}>
                  <button onClick={handleClearFilterClick} className={styles.applyButton}>
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </>
    );
  };
  
  export default DataMenu;
