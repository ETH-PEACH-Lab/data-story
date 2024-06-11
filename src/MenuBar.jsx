import React, { useState } from 'react';
import styles from './MenuBar.module.css';

const MenuBar = () => {
    const [activeMenu, setActiveMenu] = useState('');

    const menuOptions = {
        'File': ['New', 'Open', 'Save'],
        'Edit': ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'],
        'Format': ['Bold', 'Italic', 'Underline'],
        'Insert': ['Image', 'Chart', 'Table'],
        'Data': ['Sort', 'Filter', 'Validate']
    };

    const handleMenuClick = (menu) => {
        // Toggle the visibility of the secondary menu if the same item is clicked twice
        setActiveMenu(activeMenu === menu ? '' : menu);
    };

    return (
        <div className={styles.menuBarContainer}>
            <div className={styles.menuBar}>
                {Object.keys(menuOptions).map((menu, index) => (
                    <div key={index} className={styles.menuItem} onClick={() => handleMenuClick(menu)}>
                        <button className={styles.button}>
                            {menu}
                        </button>
                    </div>
                ))}
            </div>
            {activeMenu && (
                <div className={styles.secondaryMenuBar} style={{ visibility: activeMenu ? 'visible' : 'hidden' }}>
                    {menuOptions[activeMenu]?.map((item, index) => (
                        <div key={index} className={styles.secondaryMenuItem}>
                            <button className={styles.button}>
                                {item}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuBar;