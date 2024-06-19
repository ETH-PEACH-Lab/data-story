import React from 'react';
import styles from './MenuBar.module.css';

const EditMenu = () => {
    const handleMenuClick = (item) => {
        // Implement logic for Edit menu actions
        console.log(`${item} clicked`);
    };

    return (
        <>
            {['Undo', 'Redo', 'Find and Replace', 'Remove Duplicates'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                </div>
            ))}
        </>
    );
};

export default EditMenu;
