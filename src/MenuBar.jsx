import React, { useState, useRef } from 'react';
import styles from './MenuBar.module.css';
import Papa from 'papaparse';

const MenuBar = ({ onSaveCurrent, onDataLoaded }) => {
    const [activeMenu, setActiveMenu] = useState('');
    const fileInputRef = useRef(null);

    const menuOptions = {
        'File': ['New', 'Open', 'Save', 'History', 'View Comments'],
        'Edit': ['Undo', 'Redo', 'Find and replace', 'Remove duplicates'],
        'Format': ['Text', 'Box', 'Cell type', 'Headers', 'Conditional Formatting', 'Clear Formatting'],
        'Insert': ['Column', 'Row', 'Chart', 'Functions', 'Comment', 'Image', 'Tick Box'],
        'Data': ['Sort', 'Filter', 'Column Stats']
    };

    // Handle main menu click
    const handleMenuClick = (menu) => {
        setActiveMenu(activeMenu === menu ? '' : menu);
    };

    // Handle file input change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    onDataLoaded(results.data, file.name, new Date().toLocaleString());
                }
            });
        }
    };

    // Handle secondary menu item click
    const handleSecondaryMenuClick = (menu, item) => {
        if (menu === 'File' && item === 'Open') {
            fileInputRef.current.click();
        }
        // Add more conditions for other menu items
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
                <div className={styles.saveButton} onClick={onSaveCurrent}>
                    <button className={styles.button}>
                        Save Current Version
                    </button>
                </div>
            </div>
            {activeMenu && (
                <div className={styles.secondaryMenuBar} style={{ visibility: activeMenu ? 'visible' : 'hidden' }}>
                    {menuOptions[activeMenu]?.map((item, index) => (
                        <div key={index} className={styles.secondaryMenuItem} onClick={() => handleSecondaryMenuClick(activeMenu, item)}>
                            <button className={styles.button}>
                                {item}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".csv"
            />
        </div>
    );
};

export default MenuBar;