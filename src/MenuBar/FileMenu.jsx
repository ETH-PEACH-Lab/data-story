import React from 'react';
import styles from './MenuBar.module.css';

const FileMenu = ({ onSaveCurrent, onDataLoaded, toggleHistory, fileInputRef }) => {
    const generateEmptyDataset = () => {
        const emptyData = Array.from({ length: 5 }, () => Array(5).fill(null));
        return { data: emptyData };
    };

    const handleMenuClick = (item) => {
        if (item === 'New') {
            const { data } = generateEmptyDataset();
            onDataLoaded(data, `New Table ${Date.now()}`);
        } else if (item === 'Open') {
            fileInputRef.current.click();
        } else if (item === 'Save') {
            onSaveCurrent();
        } else if (item === 'History') {
            toggleHistory();
        }
    };

    return (
        <>
            {['New', 'Open', 'Save', 'History', 'View Comments'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default FileMenu;
