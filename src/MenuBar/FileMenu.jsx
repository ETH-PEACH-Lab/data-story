import React, { useRef } from 'react';
import styles from './MenuBar.module.css';
import Papa from 'papaparse';

const FileMenu = ({
  onSaveCurrent,
  onDataLoaded,
  toggleHistory,
  hotRef,
  showConfirmation,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  initialActionStack,
  setInitialActionStack, 
  initialActionStackLength,
  setInitialActionStackLength 
}) => {
  const fileInputRef = useRef(null);

  const generateEmptyDataset = () => {
    const columns = Array.from({ length: 5 }, (_, i) => `Column ${i + 1}`);
    const emptyData = Array.from({ length: 5 }, () =>
      columns.reduce((acc, column) => ({ ...acc, [column]: null }), {})
    );
    return { data: emptyData };
  };

  const areActionStacksEqual = (stack1, stack2, length) => {
    if (stack1.length !== stack2.length) return false;
    for (let i = 0; i < Math.min(length, stack1.length); i++) {
      if (JSON.stringify(stack1[i]) !== JSON.stringify(stack2[i])) {
        return false;
      }
    }
    return true;
  };

  const handleMenuClick = (item) => {
    const undoRedo = hotRef.current.hotInstance.undoRedo;

    if (!areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      setConfirmationMessage('You have unsaved changes. Do you want to save them?');
      setShowConfirmation(true);
      setOnConfirmAction(() => () => {
        onSaveCurrent();
        if (item === 'New') {
          const { data } = generateEmptyDataset();
          onDataLoaded(data, `New Table ${Date.now()}`);
          resetFiltersAndSorting();
        } else if (item === 'Open') {
          fileInputRef.current.click();
        }
      });
      setOnCancelAction(() => () => {
        if (item === 'New') {
          const { data } = generateEmptyDataset();
          onDataLoaded(data, `New Table ${Date.now()}`);
          resetFiltersAndSorting();
        } else if (item === 'Open') {
          fileInputRef.current.click();
        }
      });
    } else {
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
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const data = Papa.parse(text, { header: true }).data;
        onDataLoaded(data, file.name);
        resetFiltersAndSorting();
      };
      reader.readAsText(file);
    }
  };

  const resetFiltersAndSorting = () => {
    const hotInstance = hotRef.current.hotInstance;
    hotInstance.getPlugin('filters').clearConditions();
    hotInstance.getPlugin('filters').filter();
    hotInstance.getPlugin('columnSorting').clearSort();
    hotInstance.undoRedo.clear();
    setInitialActionStack([]);
    setInitialActionStackLength(0);
  };

  return (
    <>
      {['New', 'Open', 'Save', 'History', 'View Comments'].map((item, index) => (
        <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
          <button className={styles.button}>{item}</button>
        </div>
      ))}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
    </>
  );
};

export default FileMenu;
