import React, { useState, useRef, useEffect } from 'react';
import styles from './MenuBar.module.css';

const EditMenu = ({ countAndRemoveDuplicates, tableContainerRef }) => {
    const [isRemoveDuplicatesDropdownVisible, setRemoveDuplicatesDropdownVisible] = useState(false);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const removeDuplicatesButtonRef = useRef(null);
    const removeDuplicatesDropdownRef = useRef(null);

    const handleMenuClick = (item) => {
        if (item === 'Remove Duplicates') {
            const duplicates = countAndRemoveDuplicates();
            setDuplicateCount(duplicates);
            setRemoveDuplicatesDropdownVisible(!isRemoveDuplicatesDropdownVisible);
        } else {
            console.log(`${item} clicked`);
        }
    };

    const handleClickOutside = (event) => {
        if (
            removeDuplicatesDropdownRef.current &&
            !removeDuplicatesDropdownRef.current.contains(event.target) &&
            removeDuplicatesButtonRef.current &&
            !removeDuplicatesButtonRef.current.contains(event.target) &&
            (!tableContainerRef.current || !tableContainerRef.current.contains(event.target))
        ) {
            setRemoveDuplicatesDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRemoveDuplicates = () => {
        countAndRemoveDuplicates(true);
        setRemoveDuplicatesDropdownVisible(false);
    };

    return (
        <>
            {['Undo', 'Redo', 'Find and Replace', 'Remove Duplicates'].map((item, index) => (
                <div key={index} className={styles.secondaryMenuItem} onClick={() => handleMenuClick(item)}>
                    <button ref={item === 'Remove Duplicates' ? removeDuplicatesButtonRef : null} className={styles.button}>
                        {item}
                    </button>
                    {item === 'Remove Duplicates' && isRemoveDuplicatesDropdownVisible && (
                        <div
                            className={styles.Dropdown}
                            style={{ top: removeDuplicatesButtonRef.current?.getBoundingClientRect().bottom, left: removeDuplicatesButtonRef.current?.getBoundingClientRect().left }}
                            onClick={(e) => e.stopPropagation()}
                            ref={removeDuplicatesDropdownRef}
                        >
                            <div className={styles.textOption}>
                                Number of duplicate rows: {duplicateCount}
                            </div>
                            <div className={styles.textOption}>
                                <button onClick={handleRemoveDuplicates} className={styles.applyButton}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default EditMenu;
