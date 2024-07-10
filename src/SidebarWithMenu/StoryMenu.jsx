import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './StoryMenu.module.css';

const StoryMenu = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [isTextDropdownVisible, setTextDropdownVisible] = useState(false);
  const textButtonRef = useRef(null);
  const textDropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const addTextBox = (type) => {
    const addEvent = new CustomEvent('addTextBox', { detail: { type } });
    document.dispatchEvent(addEvent);
    setTextDropdownVisible(false);
  };

  const handleClickOutside = (event) => {
    if (
      !(
        (textDropdownRef.current && textDropdownRef.current.contains(event.target)) ||
        (textButtonRef.current && textButtonRef.current.contains(event.target))
      )
    ) {
      setTextDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    if (isTextDropdownVisible && textButtonRef.current) {
      const buttonRect = textButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom,
        left: buttonRect.left,
      });
    }
  }, [isTextDropdownVisible]);

  const menuOptions = {
    'Insert': (
      <div className={styles.secondaryMenuBar}>
        {['Text', 'Chart', 'Table', 'Function'].map((item, index) => (
          <div key={index} className={styles.secondaryMenuItem}>
            <button
              className={styles.button}
              onClick={item === 'Text' ? () => setTextDropdownVisible(!isTextDropdownVisible) : undefined}
              ref={item === 'Text' ? textButtonRef : null}
            >
              {item}
            </button>
            {item === 'Text' && isTextDropdownVisible && (
              <div
                className={styles.dropdown}
                style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                ref={textDropdownRef}
              >
                {['Title', 'Subtitle', 'Text'].map((option, index) => (
                  <div key={index} className={styles.textOption} onClick={() => addTextBox(option.toLowerCase())}>
                    {option}
                  </div>
                ))}
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
