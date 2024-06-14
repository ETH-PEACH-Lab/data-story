import React, { useState } from 'react';
import styles from './MenuBar.module.css';

const FormatMenu = ({ isColorDropdownVisible, setIsColorDropdownVisible, onColorSelect, onTextStyleChange }) => {
    const [isTextDropdownVisible, setIsTextDropdownVisible] = useState(false);

    const colors = [
        '#000000', '#AB14E2', '#FF0000', '#FF8700', '#FFD300',
        '#FFFFFF', '#0AEFFF', '#580AFF', '#1C7B53', '#A1FF0A'
    ];

    const handleMenuClick = (item) => {
        if (item === 'Text') {
            setIsTextDropdownVisible(!isTextDropdownVisible);
            setIsColorDropdownVisible(false);
        } else if (item === 'Color') {
            setIsColorDropdownVisible(!isColorDropdownVisible);
        } else {
            setIsTextDropdownVisible(false);
            setIsColorDropdownVisible(false);
            onTextStyleChange(item.toLowerCase().replace('-', ''));
        }
        console.log(`${item} clicked`);
    };

    const handleColorClick = (color) => {
        console.log(`Selected color: ${color}`);
        onColorSelect(color);
        setIsTextDropdownVisible(false);
        setIsColorDropdownVisible(false);
    };

    return (
        <>
            {['Text', 'Box', 'Type', 'Headers', 'Conditional Formatting', 'Clear Formatting'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button className={styles.button}>{item}</button>
                    {item === 'Text' && isTextDropdownVisible && (
                        <div className={styles.textDropdown}>
                            {['Bold', 'Italic', 'Strike-through', 'Color'].map((textOption, idx) => (
                                <div
                                    key={idx}
                                    className={styles.textOption}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuClick(textOption);
                                    }}
                                >
                                    {textOption}
                                    {textOption === 'Color' && isColorDropdownVisible && (
                                        <div className={styles.colorDropdown}>
                                            {colors.map((color, idx) => (
                                                <div
                                                    key={idx}
                                                    className={styles.colorSquare}
                                                    style={{ backgroundColor: color }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleColorClick(color);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default FormatMenu;
