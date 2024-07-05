import React from 'react';
import styles from './MenuBar.module.css';

const FileMenu = ({ onSaveCurrent, onDataLoaded, toggleHistory, fileInputRef, hotRef }) => {
  const generateEmptyDataset = () => {
    const columns = Array.from({ length: 5 }, (_, i) => `Column ${i + 1}`);
    const emptyData = Array.from({ length: 5 }, () => 
      columns.reduce((acc, column) => ({ ...acc, [column]: null }), {})
    );
    return { data: emptyData };
  };

  const handleMenuClick = (item) => {
    if (item === 'New') {
      const { data } = generateEmptyDataset();
      onDataLoaded(data, `New Table ${Date.now()}`);
      resetFiltersAndSorting();
    } else if (item === 'Open') {
      fileInputRef.current.click();
      resetFiltersAndSorting();
    } else if (item === 'Save') {
      onSaveCurrent();
    } else if (item === 'History') {
      toggleHistory();
    }
  };

  const resetFiltersAndSorting = () => {
    const hotInstance = hotRef.current.hotInstance;
    hotInstance.getPlugin('filters').clearConditions();
    hotInstance.getPlugin('filters').filter();
    hotInstance.getPlugin('columnSorting').clearSort();
  };

  return (
    <>
      {['New', 'Open', 'Save', 'History', 'View Comments'].map((item, index) => (
        <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
          <button className={styles.button}>{item}</button>
        </div>
      ))}
    </>
  );
};

export default FileMenu;
