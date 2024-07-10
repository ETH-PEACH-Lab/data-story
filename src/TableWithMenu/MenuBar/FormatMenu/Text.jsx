import React, { useRef } from 'react';
import styles from '../MenuBar.module.css';

const Text = ({ position, onStyleChange, stopPropagation, handleMenuClick, handleColorClick, isColorDropdownVisible, colorDropdownPosition, originalColors }) => {
  const colorButtonRef = useRef(null);

  return (
    <div className={styles.Dropdown} style={{ top: position.top, left: position.left }} onClick={stopPropagation}>
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
            {textOption === 'Color' && isColorDropdownVisible && (
              <div className={styles.colorDropdown} style={{ top: colorDropdownPosition.top - 176, left: colorDropdownPosition.left + 100 }}>
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
  );
};

export default Text;
