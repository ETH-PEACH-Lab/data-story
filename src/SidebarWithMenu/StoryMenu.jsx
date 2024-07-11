// StoryMenu.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './StoryMenu.module.css';

const StoryMenu = ({ selectedRange, tableContainerRef }) => {
  const [activeMenu, setActiveMenu] = useState('');
  const [isTextDropdownVisible, setTextDropdownVisible] = useState(false);
  const [isFunctionDropdownVisible, setFunctionDropdownVisible] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('');
  const functionButtonRef = useRef(null);
  const functionDropdownRef = useRef(null);
  const [functionDropdownPosition, setFunctionDropdownPosition] = useState({ top: 0, left: 0 });

  const handleMenuClick = (menu) => {
    if (activeMenu === menu) {
      setActiveMenu('');
    } else {
      setActiveMenu(menu);
      setTextDropdownVisible(false);
      setFunctionDropdownVisible(false);
    }
  };

  const addComponent = (type, column = '', func = '') => {
    const addEvent = new CustomEvent('addComponent', { detail: { type, column, func } });
    document.dispatchEvent(addEvent);
    setTextDropdownVisible(false);
    setFunctionDropdownVisible(false);
  };

  const handleClickOutside = (event) => {
    if (
      !(
        (functionDropdownRef.current && functionDropdownRef.current.contains(event.target)) ||
        (functionButtonRef.current && functionButtonRef.current.contains(event.target)) ||
        (tableContainerRef.current && tableContainerRef.current.contains(event.target))
      )
    ) {
      setFunctionDropdownVisible(false);
    }
  };

  const updateDropdownPosition = (buttonRef, setDropdownPosition) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY - 131,
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', () => {
      if (isTextDropdownVisible) updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
      if (isFunctionDropdownVisible) updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', () => {
        if (isTextDropdownVisible) updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
        if (isFunctionDropdownVisible) updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
      });
    };
  }, [isTextDropdownVisible, isFunctionDropdownVisible]);

  useLayoutEffect(() => {
    if (isFunctionDropdownVisible) {
      updateDropdownPosition(functionButtonRef, setFunctionDropdownPosition);
    }
  }, [isFunctionDropdownVisible]);

  const generateRangeString = () => {
    if (selectedRange.allCols) {
      const colWord = selectedRange.minCol === selectedRange.maxCol ? 'Column' : 'Columns';
      const colRange = selectedRange.minCol === selectedRange.maxCol ? `${selectedRange.minCol + 1}` : `${selectedRange.minCol + 1}-${selectedRange.maxCol + 1}`;
      return `${colWord}: ${colRange}`;
    } else if (selectedRange.allRows) {
      const rowWord = selectedRange.minRow === selectedRange.maxRow ? 'Row' : 'Rows';
      const rowRange = selectedRange.minRow === selectedRange.maxRow ? `${selectedRange.minRow + 1}` : `${selectedRange.minRow + 1}-${selectedRange.maxRow + 1}`;
      return `${rowWord}: ${rowRange}`;
    } else {
      const rowWord = selectedRange.minRow === selectedRange.maxRow ? 'Row' : 'Rows';
      const colWord = selectedRange.minCol === selectedRange.maxCol ? 'Column' : 'Columns';
      const rowRange = selectedRange.minRow === selectedRange.maxRow ? `${selectedRange.minRow + 1}` : `${selectedRange.minRow + 1}-${selectedRange.maxRow + 1}`;
      const colRange = selectedRange.minCol === selectedRange.maxCol ? `${selectedRange.minCol + 1}` : `${selectedRange.minCol + 1}-${selectedRange.maxCol + 1}`;
      return `${rowWord}: ${rowRange}, ${colWord}: ${colRange}`;
    }
  };

  const handleFunctionApply = () => {
    const rangeString = generateRangeString();
    addComponent('function', rangeString, selectedFunction);
  };
  
  const menuOptions = {
    'Insert': (
      <div className={styles.secondaryMenuBar}>
        {['Text', 'Chart', 'Table', 'Function'].map((item, index) => (
          <div key={index} className={styles.secondaryMenuItem}>
            <button
              className={styles.button}
              onClick={item === 'Text' ? () => { setTextDropdownVisible(!isTextDropdownVisible); setFunctionDropdownVisible(false); } : (item === 'Function' ? () => { setFunctionDropdownVisible(!isFunctionDropdownVisible); setTextDropdownVisible(false); } : undefined)}
              ref={item === 'Text' ? functionButtonRef : (item === 'Function' ? functionButtonRef : null)}
            >
              {item}
            </button>
            {item === 'Text' && isTextDropdownVisible && (
              <div
                className={styles.dropdown}
                style={{ top: `${functionDropdownPosition.top}px`}}
                ref={functionDropdownRef}
              >
                {['Title', 'Subtitle', 'Text'].map((option, index) => (
                  <div key={index} className={styles.textOption} onClick={() => addComponent(option.toLowerCase())}>
                    {option}
                  </div>
                ))}
              </div>
            )}
            {item === 'Function' && isFunctionDropdownVisible && (
              <div
                className={styles.dropdown}
                style={{ top: `${functionDropdownPosition.top}px`, marginLeft: '112px'}}
                ref={functionDropdownRef}
              >
                <div className={styles.dropdownSection}>
                  <label className={styles.dropdownTitle}>Selected Range:</label>
                  <div className={styles.selectedRangeDisplay}>
                    {selectedRange ? generateRangeString() : 'No range selected'}
                  </div>
                </div>
                <div className={styles.dropdownSection}>
                  <label className={styles.dropdownTitle}>Select Function:</label>
                  <select
                    value={selectedFunction}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="" disabled>Select a function</option>
                    {['AVERAGE', 'SUM', 'MAX', 'MIN', 'COUNT', 'COUNT EMPTY', 'COUNT UNIQUE'].map((func, index) => (
                      <option key={index} value={func}>{func}</option>
                    ))}
                  </select>
                </div>
                <button className={styles.applyButton} onClick={handleFunctionApply}>Insert</button>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    'Format': (
      <div className={styles.secondaryMenuBar}>
        {['Bla', 'Color'].map((item, index) => (
          <div key={index} className={styles.secondaryMenuItem}>
            <button className={styles.button}>{item}</button>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className={styles.menuBarContainer}>
      <div className={styles.menuBar}>
        {Object.keys(menuOptions).map((menu, index) => (
          <div
            key={index}
            className={`${styles.menuItem} ${activeMenu === menu ? styles.activeMenuItem : ''}`}
            onClick={() => handleMenuClick(menu)}
          >
            <button className={styles.button}>
              {menu}
            </button>
          </div>
        ))}
      </div>
      {activeMenu && (
        <div className={styles.secondaryMenuBar}>
          {menuOptions[activeMenu]}
        </div>
      )}
    </div>
  );
};

export default StoryMenu;
