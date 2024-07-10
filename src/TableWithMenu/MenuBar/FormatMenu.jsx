import React, { useState, useRef, useEffect } from 'react';
import styles from './MenuBar.module.css';
import Text from './FormatMenu/Text';
import Cell from './FormatMenu/Cell';
import Headers from './FormatMenu/Headers';
import Type from './FormatMenu/Type';

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

const FormatMenu = ({ onStyleChange, selectedColumnIndex, selectedColumnName, setColumns, columns, tableContainerRef, hotRef }) => {
  const [dropdownState, setDropdownState] = useState({
    isTextDropdownVisible: false,
    isCellDropdownVisible: false,
    isColorDropdownVisible: false,
    isHeadersDropdownVisible: false,
    isTypeDropdownVisible: false,
    dropdownPosition: { top: 0, left: 0 },
    colorDropdownPosition: { top: 0, left: 0 },
    colorContext: ''
  });

  const textButtonRef = useRef(null);
  const cellButtonRef = useRef(null);
  const headersButtonRef = useRef(null);
  const typeButtonRef = useRef(null);

  const menuItems = ['Text', 'Cell', 'Type', 'Headers', 'Conditional Formatting', 'Clear Formatting'];

  const typeMapping = {
    text: 'Text',
    numeric: 'Number',
    date: 'Date',
    time: 'Time'
  };

  const reverseTypeMapping = {
    'Text': 'text',
    'Number': 'numeric',
    'Date': 'date',
    'Time': 'time'
  };

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
            isTypeDropdownVisible: false,
            isHeadersDropdownVisible: false,
            dropdownPosition: position
          });
          break;
        case 'Cell':
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: !dropdownState.isCellDropdownVisible,
            isColorDropdownVisible: false,
            isTypeDropdownVisible: false,
            isHeadersDropdownVisible: false,
            dropdownPosition: position
          });
          break;
        case 'Headers':
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            isTypeDropdownVisible: false,
            isHeadersDropdownVisible: !dropdownState.isHeadersDropdownVisible,
            dropdownPosition: position
          });
          break;
        case 'Type':
          updateDropdownState({
            isTextDropdownVisible: false,
            isCellDropdownVisible: false,
            isColorDropdownVisible: false,
            isTypeDropdownVisible: !dropdownState.isTypeDropdownVisible,
            isHeadersDropdownVisible: false,
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
            isTypeDropdownVisible: false,
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
        isTypeDropdownVisible: false,
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
      isTypeDropdownVisible: false,
    });
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleClickOutside = (event) => {
    if (
      !dropdownState.isTextDropdownVisible &&
      !dropdownState.isCellDropdownVisible &&
      !dropdownState.isColorDropdownVisible &&
      !dropdownState.isHeadersDropdownVisible &&
      !dropdownState.isTypeDropdownVisible
    ) return;
  
    if (
      textButtonRef.current && textButtonRef.current.contains(event.target) ||
      cellButtonRef.current && cellButtonRef.current.contains(event.target) ||
      headersButtonRef.current && headersButtonRef.current.contains(event.target) ||
      typeButtonRef.current && typeButtonRef.current.contains(event.target) ||
      (tableContainerRef.current && tableContainerRef.current.contains(event.target))
    ) return;

    setDropdownState({
      isTextDropdownVisible: false,
      isCellDropdownVisible: false,
      isColorDropdownVisible: false,
      isHeadersDropdownVisible: false,
      isTypeDropdownVisible: false,
    });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownState]);

  return (
    <>
      {menuItems.map((item, index) => {
        const buttonRef = item === 'Text' ? textButtonRef : item === 'Cell' ? cellButtonRef : item === 'Headers' ? headersButtonRef : item === 'Type' ? typeButtonRef : null;
        return (
          <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item, buttonRef)}>
            <div ref={buttonRef} className={styles.button}>{item}</div>
            {item === 'Text' && dropdownState.isTextDropdownVisible && (
              <Text
                position={dropdownState.dropdownPosition}
                onStyleChange={onStyleChange}
                stopPropagation={stopPropagation}
                handleMenuClick={handleMenuClick}
                handleColorClick={handleColorClick}
                isColorDropdownVisible={dropdownState.isColorDropdownVisible}
                colorDropdownPosition={dropdownState.colorDropdownPosition}
                originalColors={originalColors}
              />
            )}
            {item === 'Cell' && dropdownState.isCellDropdownVisible && (
              <Cell
                position={dropdownState.dropdownPosition}
                stopPropagation={stopPropagation}
                handleMenuClick={handleMenuClick}
                handleColorClick={handleColorClick}
                isColorDropdownVisible={dropdownState.isColorDropdownVisible}
                colorDropdownPosition={dropdownState.colorDropdownPosition}
                tintedColors={tintedColors}
                originalColors={originalColors}
                colorContext={dropdownState.colorContext}
              />
            )}
            {item === 'Headers' && dropdownState.isHeadersDropdownVisible && (
              <Headers
                position={dropdownState.dropdownPosition}
                stopPropagation={stopPropagation}
                selectedColumnIndex={selectedColumnIndex}
                selectedColumnName={selectedColumnName}
                setColumns={setColumns}
                hotRef={hotRef}
              />
            )}
            {item === 'Type' && dropdownState.isTypeDropdownVisible && (
              <Type
                position={dropdownState.dropdownPosition}
                stopPropagation={stopPropagation}
                selectedColumnIndex={selectedColumnIndex}
                columns={columns}
                setColumns={setColumns}
                typeMapping={typeMapping}
                reverseTypeMapping={reverseTypeMapping}
                selectedColumnName={selectedColumnName}
                hotRef={hotRef}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default FormatMenu;
