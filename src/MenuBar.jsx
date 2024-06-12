import React, { useState, useRef } from 'react';
import styles from './MenuBar.module.css';
import Papa from 'papaparse';

const MenuBar = ({ onSaveCurrent, onDataLoaded, toggleHistory }) => {
    const [activeMenu, setActiveMenu] = useState('');
    const fileInputRef = useRef(null);

    const menuOptions = {
        'File': ['New', 'Open', 'Save', 'History', 'View Comments'],
        'Edit': ['Undo', 'Redo', 'Find and Replace', 'Remove Duplicates'],
        'Format': ['Text', 'Box', 'Type', 'Headers', 'Conditional Formatting', 'Clear Formatting'],
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
                    onDataLoaded(results.data, file.name);
                }
            });
        }
    };

    // Generate an empty dataset of size 5x5
    const generateEmptyDataset = () => {
        const emptyData = Array.from({ length: 5 }, () => Array(5).fill(null));
        return { data: emptyData };
    };

    // Action handlers
    const actionHandlers = {
        'File': {
            'New': () => {
                const { data } = generateEmptyDataset();
                onDataLoaded(data, `New Table ${Date.now()}`);
            },
            'Open': () => fileInputRef.current.click(),
            'Save': onSaveCurrent,
            'History': toggleHistory,
            'View Comments': () => { /* TODO */ },
        },
        'Edit': {
            'Undo': () => { /* TODO */ },
            'Redo': () => { /* TODO */ },
            'Find and Replace': () => { /* TODO */ },
            'Remove Duplicates': () => { /* TODO */ },
        },
        'Format': {
            'Text': () => { /* TODO */ },
            'Box': () => { /* TODO */ },
            'Type': () => { /* TODO */ },
            'Headers': () => { /* TODO */ },
            'Conditional Formatting': () => { /* TODO */ },
            'Clear Formatting': () => { /* TODO */ },
        },
        'Insert': {
            'Column': () => { /* TODO */ },
            'Row': () => { /* TODO */ },
            'Chart': () => { /* TODO */ },
            'Functions': () => { /* TODO */ },
            'Comment': () => { /* TODO */ },
            'Image': () => { /* TODO */ },
            'Tick Box': () => { /* TODO */ },
        },
        'Data': {
            'Sort': () => { /* TODO */ },
            'Filter': () => { /* TODO */ },
            'Column Stats': () => { /* TODO */ },
        }
    };

    // Handle secondary menu item click
    const handleSecondaryMenuClick = (menu, item) => {
        const menuActions = actionHandlers[menu];
        if (menuActions && menuActions[item]) {
            menuActions[item]();
        }
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