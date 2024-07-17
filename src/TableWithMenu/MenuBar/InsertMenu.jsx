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

// TODO: implement Chart
// TODO: implement Function
// TODO: implement Table?

    return (
        <>
            {['Column', 'Row', 'Chart', 'Functions'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default InsertMenu;
