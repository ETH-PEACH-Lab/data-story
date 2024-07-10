import React, { useRef } from 'react';
import styles from '../MenuBar.module.css';

const Cell = ({ position, stopPropagation, handleMenuClick, handleColorClick, isColorDropdownVisible, colorDropdownPosition, tintedColors, originalColors, colorContext }) => {
  const fillButtonRef = useRef(null);
  const borderButtonRef = useRef(null);

  const colors = {
    Fill: tintedColors,
    Border: originalColors
  };

  return (
    <div className={styles.Dropdown} style={{ top: position.top, left: position.left }} onClick={stopPropagation}>
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
            {isColorDropdownVisible && colorContext === cellOption.toLowerCase() && (
              <div className={styles.colorDropdown} style={{ top: colorDropdownPosition.top - 176, left: colorDropdownPosition.left - 54 }}>
                {colors[cellOption].map((color, idx) => (
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
  );
};

export default Cell;
