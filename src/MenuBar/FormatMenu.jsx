import React, { useState, useRef } from 'react';
import styles from './MenuBar.module.css';

function tintColor(color, percentage) {
  const decimalPercentage = percentage / 100;
  const hex = color.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.round(r + (255 - r) * decimalPercentage);
  const newG = Math.round(g + (255 - g) * decimalPercentage);
  const newB = Math.round(b + (255 - b) * decimalPercentage);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

const originalColors = [
  '#000000', '#AB14E2', '#FF0000', '#FF8700', '#FFD300',
  '#FFFFFF', '#0AEFFF', '#580AFF', '#1C7B53', '#A1FF0A'
];

const tintedColors = originalColors.map(color => tintColor(color, 60));

const FormatMenu = ({ onStyleChange, selectedColumnIndex, selectedColumnName, setColumns }) => {
  const [dropdownState, setDropdownState] = useState({
    isTextDropdownVisible: false,
    isCellDropdownVisible: false,
    isColorDropdownVisible: false,
    isHeadersDropdownVisible: false,
    dropdownPosition: { top: 0, left: 0 },
    colorDropdownPosition: { top: 0, left: 0 },
    colorContext: ''
  });

  const [newColumnName, setNewColumnName] = useState('');
  const textButtonRef = useRef(null);
  const cellButtonRef = useRef(null);
  const colorButtonRef = useRef(null);
  const fillButtonRef = useRef(null);
  const borderButtonRef = useRef(null);
  const headersButtonRef = useRef(null);

  const menuItems = ['Text', 'Cell', 'Type', 'Headers', 'Conditional Formatting', 'Clear Formatting'];

  const handleMenuClick = (item, buttonRef) => {
    const updateDropdownState = (updates) => setDropdownState(prev => ({ ...prev, ...updates }));

    if (buttonRef && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const position = { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX };

      switch (item) {
        case 'Text':
          updateDropdownState({
            isTextDropdownVisible: !dropdownState.isTextDropdownVisible,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            isHeadersDropdownVisible: false,
            dropdownPosition: position
          });
          break;
        case 'Cell':
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: !dropdownState.isCellDropdownVisible,
            isColorDropdownVisible: false,
            isHeadersDropdownVisible: false,
            dropdownPosition: position
          });
          break;
        case 'Headers':
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            isHeadersDropdownVisible: !dropdownState.isHeadersDropdownVisible,
            dropdownPosition: position
          });
          break;
        case 'Color':
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: 'text',
            colorDropdownPosition: position
          });
          break;
        case 'Fill':
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: 'fill',
            colorDropdownPosition: position
          });
          break;
        case 'Border':
          updateDropdownState({
            isColorDropdownVisible: !dropdownState.isColorDropdownVisible,
            colorContext: 'border',
            colorDropdownPosition: position
          });
          break;
        default:
          setDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            isHeadersDropdownVisible: false,
          });
      }
    }
    if (['Bold', 'Italic', 'Strike-through', 'Clear Formatting'].includes(item)) {
      onStyleChange(item.toLowerCase().replace('-', ''), null);
      updateDropdownState({
        isTextDropdownVisible: false,
        isCellDropdownVisible: false,
        isColorDropdownVisible: false,
        isHeadersDropdownVisible: false,
      });
    }
  };

  const handleColorClick = (color) => {
    const { colorContext } = dropdownState;
    onStyleChange(colorContext === 'text' ? 'color' : colorContext === 'fill' ? 'backgroundColor' : 'borderColor', color);
    setDropdownState({
      isTextDropdownVisible: false,
      isCellDropdownVisible: false,
      isColorDropdownVisible: false,
      isHeadersDropdownVisible: false,
    });
  };

  const handleRenameColumn = () => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], title: newColumnName };
      return newColumns;
    });
    setNewColumnName('');
    setDropdownState(prev => ({ ...prev, isHeadersDropdownVisible: false }));
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {menuItems.map((item, index) => {
        const buttonRef = item === 'Text' ? textButtonRef : item === 'Cell' ? cellButtonRef : item === 'Headers' ? headersButtonRef : null;
        return (
          <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item, buttonRef)}>
            <div ref={buttonRef} className={styles.button}>{item}</div>
            {item === 'Text' && dropdownState.isTextDropdownVisible && (
              <div className={styles.Dropdown} style={{ top: dropdownState.dropdownPosition.top, left: dropdownState.dropdownPosition.left }} onClick={stopPropagation}>
                {['Bold', 'Italic', 'Strike-through', 'Color'].map((textOption, idx) => {
                  const ref = textOption === 'Color' ? colorButtonRef : null;
                  return (
                    <div
                      key={idx}
                      className={styles.textOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(textOption, ref);
                      }}
                    >
                      <div ref={ref} className={styles.dropdownItem}>{textOption}</div>
                      {textOption === 'Color' && dropdownState.isColorDropdownVisible && dropdownState.colorContext === 'text' && (
                        <div className={styles.colorDropdown} style={{ top: dropdownState.colorDropdownPosition.top - 176, left: dropdownState.colorDropdownPosition.left + 100 }}>
                          {originalColors.map((color, idx) => (
                            <div
                              key={idx}
                              className={styles.colorSquare}
                              style={{ backgroundColor: color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorClick(color);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {item === 'Cell' && dropdownState.isCellDropdownVisible && (
              <div className={styles.Dropdown} style={{ top: dropdownState.dropdownPosition.top, left: dropdownState.dropdownPosition.left }} onClick={stopPropagation}>
                {['Fill', 'Border'].map((cellOption, idx) => {
                  const ref = cellOption === 'Fill' ? fillButtonRef : borderButtonRef;
                  return (
                    <div
                      key={idx}
                      className={styles.textOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(cellOption, ref);
                      }}
                    >
                      <div ref={ref} className={styles.dropdownItem}>{cellOption}</div>
                      {dropdownState.isColorDropdownVisible && dropdownState.colorContext === cellOption.toLowerCase() && (
                        <div className={styles.colorDropdown} style={{ top: dropdownState.colorDropdownPosition.top - 176, left: dropdownState.colorDropdownPosition.left - 54 }}>
                          {(dropdownState.colorContext === 'fill' ? tintedColors : originalColors).map((color, idx) => (
                            <div
                              key={idx}
                              className={styles.colorSquare}
                              style={{ backgroundColor: color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorClick(color);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {item === 'Headers' && dropdownState.isHeadersDropdownVisible && (
              <div className={styles.Dropdown} style={{ top: dropdownState.dropdownPosition.top, left: dropdownState.dropdownPosition.left }} onClick={stopPropagation}>
                <div className={styles.textOption}>
                  <div>Coordinates: {selectedColumnIndex !== null
                    ? `Column ${selectedColumnIndex + 1}` 
                    : 'No column selected'}
                  </div>
                </div>
                <div className={styles.textOption}>
                  <div>Current Name: {selectedColumnName}</div>
                </div>
                <div className={`${styles.textOption} ${styles.inputContainer}`}>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New column name"
                    className={styles.input}
                  />
                  <button onClick={handleRenameColumn} className={styles.applyButton}>
                    Rename
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default FormatMenu;
