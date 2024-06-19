import { useState, useRef } from 'react';
import styles from './MenuBar.module.css';

const DataMenu = ({ columns, selectedColumnName, handleSort }) => {
    const [isSortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const sortButtonRef = useRef(null);
  
    const handleMenuClick = (item, buttonRef) => {
      if (item === 'Sort') {
        setSortDropdownVisible(!isSortDropdownVisible);
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
  
    const stopPropagation = (e) => {
      e.stopPropagation();
    };
  
    return (
      <>
        {['Sort', 'Filter', 'Column Stats'].map((item, index) => (
          <div key={index} className={styles.secondaryMenuItem} onClick={(e) => handleMenuClick(item, sortButtonRef)}>
            <button ref={item === 'Sort' ? sortButtonRef : null} className={styles.button}>{item}</button>
            {item === 'Sort' && isSortDropdownVisible && (
              <div className={styles.Dropdown} style={{ top: sortButtonRef.current?.getBoundingClientRect().bottom, left: sortButtonRef.current?.getBoundingClientRect().left }} onClick={stopPropagation}>
                <div className={styles.textOption}>
                  <div>{selectedColumnName || 'No column selected'}</div>
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
          </div>
        ))}
      </>
    );
  };
  
  export default DataMenu;
  