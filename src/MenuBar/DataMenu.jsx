import React from 'react';
import styles from './MenuBar.module.css';

const DataMenu = () => {
    const handleMenuClick = (item) => {
        // Implement your logic for Data menu actions
        console.log(`${item} clicked`);
    };

    return (
        <>
            {['Sort', 'Filter', 'Column Stats'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default DataMenu;
