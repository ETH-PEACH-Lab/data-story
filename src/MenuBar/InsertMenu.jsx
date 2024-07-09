import React from 'react';
import styles from './MenuBar.module.css';

const InsertMenu = ({ addRow, addColumn }) => {
    const handleMenuClick = (item) => {
        if (item === 'Row') {
            addRow();
        } else if (item === 'Column') {
            addColumn();
        } else {
            console.log(`${item} clicked`);
        }
    };

    return (
        <>
            {['Column', 'Row', 'Chart', 'Functions', 'Image', 'Tick Box'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default InsertMenu;
