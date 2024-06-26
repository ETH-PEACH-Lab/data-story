import React from 'react';
import styles from './FilterComponent.module.css';

const FilterValueComponent = ({
  filteredValues,
  checkedValues,
  searchValue,
  handleSearchValueChange,
  handleCheckboxChange,
  selectAll,
  clearAll,
  handleApplyCheckboxFilter
}) => {
  return (
    <div className={styles.filterComponent}>
      <div className={styles.distinctValuesList}>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchValueChange}
          className={styles.input}
          placeholder="Search for values"
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <div className={styles.selectClearAll}>
          <button onClick={selectAll} className={styles.applyButton}>Check All</button>
          <button onClick={clearAll} className={styles.applyButton}>Uncheck All</button>
        </div>
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
      <div className={styles.applyButtonContainer}>
        <button onClick={handleApplyCheckboxFilter} className={styles.applyButton}>
          Filter by Values
        </button>
      </div>
      <div className={styles.separator}></div> {/* Add separator */}
    </div>
  );
};

export default FilterValueComponent;
