import React from 'react';
import styles from './MenuBar.module.css';

const InsertMenu = () => {
    const handleMenuClick = (item) => {
        // Implement logic for Insert menu actions
        console.log(`${item} clicked`);
    };

    return (
        <>
            {['Column', 'Row', 'Chart', 'Functions', 'Comment', 'Image', 'Tick Box'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default InsertMenu;
