// UploadButton.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

const UploadButton = ({ onDataLoaded }) => {
    const handleChange = (event) => {
        const file = event.target.files[0];
        if(file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    onDataLoaded(results.data);
                }
            });
        }
    };

    return (
        <div>
            <input type="file" onChange={handleChange} accept=".csv" />
        </div>
    );
};

export default UploadButton;
