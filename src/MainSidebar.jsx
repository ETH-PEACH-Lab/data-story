import React, { useState, useCallback, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { ResizableBox } from 'react-resizable';
import { textRenderer } from 'handsontable/renderers/textRenderer';
import Handsontable from 'handsontable';
import FilterConditionComponent from './FilterConditionComponent';
import FilterValueComponent from './FilterValueComponent';
import 'react-resizable/css/styles.css';

function MainSidebar({
    data,
    columnConfigs,
    selectedColumnIndex,
    selectedColumnName,
    handleFilter,
    hotRef
}) {
    const [tableHeight, setTableHeight] = useState(200);
    const [secondTableHeight, setSecondTableHeight] = useState(200);
    const [filterCondition, setFilterCondition] = useState('none');
    const [filterValue, setFilterValue] = useState('');
    const [allDistinctValues, setAllDistinctValues] = useState([]);
    const [filteredValues, setFilteredValues] = useState([]);
    const [checkedValues, setCheckedValues] = useState([]);
    const [confirmedunCheckedValues, setConfirmedunCheckedValues] = useState([]); // New state for confirmed checked values
    const [searchValue, setSearchValue] = useState('');

    const handleResize = (event, { size }) => {
        setTableHeight(size.height);
    };

    const handleResizeSecond = (event, { size }) => {
        setSecondTableHeight(size.height);
    };

    const selectColumnRenderer = useCallback((instance, td, row, col, prop, value, cellProperties) => {
        textRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        if (col === selectedColumnIndex) {
            td.style.backgroundColor = 'lightblue';
        }
    }, [selectedColumnIndex]);

    const secondTableRenderer = useCallback((instance, td, row, col, prop, value, cellProperties) => {
        textRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        const cellValue = instance.getDataAtCell(row, selectedColumnIndex);
        if (selectedColumnIndex != null) {
            if (col === selectedColumnIndex) {
                td.style.backgroundColor = 'lightblue';
            }
            if (!confirmedunCheckedValues.includes(cellValue)) {
                td.style.backgroundColor = 'palevioletred';
            }
        }
    }, [confirmedunCheckedValues]);

    const fetchDistinctValues = useCallback(() => {
        if (selectedColumnIndex !== null && hotRef.current) {
            const hotInstance = hotRef.current.hotInstance;
            const columnData = hotInstance.getSourceDataAtCol(selectedColumnIndex);
            const uniqueValues = [...new Set(columnData.map(value => (value !== null && value !== undefined ? value : '')))];
            
            const visibleData = hotInstance.getDataAtCol(selectedColumnIndex);
            const visibleUniqueValues = [...new Set(visibleData)];
            
            setAllDistinctValues(uniqueValues);
            setFilteredValues(uniqueValues);
            setCheckedValues(uniqueValues.filter(value => visibleUniqueValues.includes(value)));
        }
    }, [selectedColumnIndex, hotRef]);

    const handleFilterConditionChange = (event) => {
        setFilterCondition(event.target.value);
    };

    const handleFilterValueChange = (event) => {
        setFilterValue(event.target.value);
    };

    const handleFilterClick = () => {
        handleFilter(selectedColumnName, filterCondition, filterValue, columnConfigs, hotRef, checkedValues);
        setConfirmedunCheckedValues(checkedValues); // Update confirmed checked values
    };

    const handleApplyCheckboxFilter = () => {
        handleFilter(selectedColumnName, 'by_value', '', columnConfigs, hotRef, checkedValues);
        setConfirmedunCheckedValues(checkedValues); // Update confirmed checked values
    };

    const handleCheckboxChange = (value) => {
        setCheckedValues((prevCheckedValues) => {
            return prevCheckedValues.includes(value)
                ? prevCheckedValues.filter(v => v !== value)
                : [...prevCheckedValues, value];
        });
    };

    const selectAll = () => {
        setCheckedValues((prevCheckedValues) => [
            ...prevCheckedValues,
            ...filteredValues.filter(value => !prevCheckedValues.includes(value)),
        ]);
    };

    const clearAll = () => {
        setCheckedValues((prevCheckedValues) =>
            prevCheckedValues.filter(value => !filteredValues.includes(value))
        );
    };

    const resetFilter = () => {
        setFilterCondition('none');
        setFilterValue('');
        setCheckedValues([]);
        setConfirmedunCheckedValues([]); // Reset confirmed checked values
        handleFilter(selectedColumnName, 'none', '', columnConfigs, hotRef, []);
        setTimeout(fetchDistinctValues, 0); // Fetch distinct values again after resetting filter
    };

    const handleSearchValueChange = (event) => {
        setSearchValue(event.target.value);
    };

    useEffect(() => {
        fetchDistinctValues();
    }, [selectedColumnIndex, hotRef, fetchDistinctValues]);

    useEffect(() => {
        if (confirmedunCheckedValues.length) {
            fetchDistinctValues();
        }
    }, [confirmedunCheckedValues, fetchDistinctValues]);

    return (
        <div className="sidebar">
            <h2>Filtering</h2>
            <p>
                Filtering is a crucial process in data science that involves selecting a subset of data 
                based on specific criteria. This helps in focusing on relevant data, improving analysis 
                accuracy, and enhancing insights. Filters can be applied based on various conditions.
            </p>
            <h3>Select column</h3>
            <p>
                To apply the filter to the data, you need to select a column first.
            </p>
            <p>
            <strong>Selected column:</strong> {selectedColumnIndex !== null ? `index ${selectedColumnIndex}, ${selectedColumnName}` : "None"}
            </p>
            <ResizableBox
                width={Infinity}
                height={tableHeight}
                minConstraints={[150, 150]}
                onResize={handleResize}
                resizeHandles={['s']}
            >
                <div className="small-table-wrapper" style={{ width: '100%', height: tableHeight, overflow: 'auto' }}>
                    <HotTable
                        data={data}
                        colHeaders={columnConfigs.map((column) => column.title)}
                        columns={columnConfigs.map((col) => ({
                            ...col,
                            renderer: selectColumnRenderer
                        }))}
                        rowHeaders={true}
                        width="100%"
                        height="100%"
                        licenseKey="non-commercial-and-evaluation"
                        readOnly={true} // Make the table read-only
                        disableVisualSelection={true}
                    />
                </div>
            </ResizableBox>
            <h3>Filter Conditions</h3>
            <p>
                You can filter data by applying conditions such as equals, not equals, containes, does not contain, etc.
            </p>
            <p>
                Select what condition the data in that column should fulfill to be visible:
            </p>
            <FilterConditionComponent
                filterCondition={filterCondition}
                filterValue={filterValue}
                handleFilterConditionChange={handleFilterConditionChange}
                handleFilterValueChange={handleFilterValueChange}
                handleFilterClick={handleFilterClick}
            />
            <p>
                Or you can simply select manually what data you want to display:
            </p>
            <FilterValueComponent
                filteredValues={filteredValues}
                checkedValues={checkedValues}
                searchValue={searchValue}
                handleSearchValueChange={handleSearchValueChange}
                handleCheckboxChange={handleCheckboxChange}
                selectAll={selectAll}
                clearAll={clearAll}
                handleApplyCheckboxFilter={handleApplyCheckboxFilter}
            />
            <p>
                Rows that are filtered out and no longer appear in the main table are tinted red.
            </p>
            <ResizableBox
                width={Infinity}
                height={secondTableHeight}
                minConstraints={[150, 150]}
                onResize={handleResizeSecond}
                resizeHandles={['s']}
            >
                <div className="small-table-wrapper" style={{ width: '100%', height: secondTableHeight, overflow: 'auto' }}>
                    <HotTable
                        data={data}
                        colHeaders={columnConfigs.map((column) => column.title)}
                        columns={columnConfigs.map((col) => ({
                            ...col,
                            renderer: secondTableRenderer
                        }))}
                        rowHeaders={true}
                        width="100%"
                        height="100%"
                        licenseKey="non-commercial-and-evaluation"
                        readOnly={true} // Make the table read-only
                        disableVisualSelection={true}
                    />
                </div>
            </ResizableBox>
        </div>
    );
}

export default MainSidebar;
