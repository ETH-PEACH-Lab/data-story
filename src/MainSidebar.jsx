import React from 'react';
import SaveCurrentButton from './SaveCurrent';

function MainSidebar({
    replacementValue,
    setReplacementValue,
    handleReplaceClick,
    selectedColumnIndex,
    selectedColumnName
}) {
    return (
        <div className="sidebar">
            <p>Select a column to replace its missing values.</p>
            <div>
                <input
                    type="text"
                    placeholder="Replacement value"
                    value={replacementValue}
                    onChange={(e) => setReplacementValue(e.target.value)}
                />
                {selectedColumnIndex !== null && (
                    <p>Selected Column: {selectedColumnName}</p>
                )}
                <button onClick={handleReplaceClick} disabled={selectedColumnIndex === null}>
                    Replace Missing Values.
                </button>
            </div>
        </div>
    );
}

export default MainSidebar;