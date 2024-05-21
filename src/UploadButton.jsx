// UploadButton.jsx
import React from 'react';
import Papa from 'papaparse';

const UploadButton = ({ onDataLoaded }) => {
    const handleChange = (event) => {
        const file = event.target.files[0];
        if(file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    onDataLoaded(results.data, file.name, new Date().toLocaleString());
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
