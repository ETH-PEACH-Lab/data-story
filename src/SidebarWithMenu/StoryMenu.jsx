import React, { useState } from 'react';
import styles from './StoryMenu.module.css';

const StoryMenu = () => {
  const [activeMenu, setActiveMenu] = useState('');

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const addTextBox = () => {
    const addEvent = new CustomEvent('addTextBox');
    document.dispatchEvent(addEvent);
  };

  const menuOptions = {
    'Insert': (
      <div className={styles.secondaryMenuBar}>
        {['Text', 'Chart', 'Table', 'Function'].map((item, index) => (
          <div key={index} className={styles.secondaryMenuItem}>
            <button
              className={styles.button}
              onClick={item === 'Text' ? addTextBox : undefined}
            >
              {item}
            </button>
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
