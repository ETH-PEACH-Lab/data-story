import React, { useState, useCallback, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { ResizableBox } from 'react-resizable';
import { textRenderer } from 'handsontable/renderers/textRenderer';
import FilterConditionComponent from './FilterConditionComponent';
import FilterValueComponent from './FilterValueComponent';
import 'react-resizable/css/styles.css';
import styles from './FilterComponent.module.css';

function MainSidebar({
    data,
    columnConfigs,
    selectedColumnIndex,
    selectedColumnName,
    handleFilter,
    hotRef
}) {
    const [tableHeight, setTableHeight] = useState(180);
    const [secondTableHeight, setSecondTableHeight] = useState(400);
    const [filterCondition, setFilterCondition] = useState('none');
    const [filterValue, setFilterValue] = useState('');
    const [allDistinctValues, setAllDistinctValues] = useState([]);
    const [filteredValues, setFilteredValues] = useState([]);
    const [checkedValues, setCheckedValues] = useState([]);
    const [confirmedCheckedValues, setConfirmedCheckedValues] = useState([]);
    const [confirmedSelectedColumn, setConfirmedSelectedColumn] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [tableKey, setTableKey] = useState(false);
    const [showNotes, setShowNotes] = useState(true); // New state for notes visibility

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

    const FilteredTableRenderer = useCallback((instance, td, row, col, prop, value, cellProperties) => {
        textRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        const cellValue = instance.getDataAtCell(row, confirmedSelectedColumn);
        if (confirmedSelectedColumn != null) {
            if (col === confirmedSelectedColumn) {
                td.style.backgroundColor = 'lightblue';
            }
            if (!confirmedCheckedValues.includes(cellValue)) {
                td.style.backgroundColor = 'palevioletred';
            }
        }
        setTableKey(prevKey => false);
    }, [confirmedCheckedValues, confirmedSelectedColumn]);

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

    const handleFilterByConditionClick = () => {
        if (selectedColumnIndex === undefined) return;
        const column = columnConfigs[selectedColumnIndex]?.data;
        if (!column) return;
    
        const newCheckedValues = data.filter(row => {
          const cellValue = row[column];
          switch (filterCondition) {
            case 'empty':
              return cellValue === '';
            case 'not_empty':
              return cellValue !== '';
            case 'eq':
              return cellValue === filterValue;
            case 'neq':
              return cellValue !== filterValue;
              case 'begins_with':
                return typeof cellValue === 'string' && cellValue.startsWith(filterValue);
              case 'ends_with':
                return typeof cellValue === 'string' && cellValue.endsWith(filterValue);
              case 'contains':
                return typeof cellValue === 'string' && cellValue.includes(filterValue);
              case 'not_contains':
                return typeof cellValue === 'string' && !cellValue.includes(filterValue);
            default:
              return true;
          }
        }).map(row => row[column]);
    
        setCheckedValues(newCheckedValues);
        setConfirmedCheckedValues(newCheckedValues);
        setConfirmedSelectedColumn(selectedColumnIndex);
        handleFilter(selectedColumnName, 'by_value', '', columnConfigs, hotRef, newCheckedValues);
      };     

    const handleApplyCheckboxFilter = () => {
        setConfirmedCheckedValues(checkedValues); // Update confirmed checked values
        setConfirmedSelectedColumn(selectedColumnIndex);
        handleFilter(selectedColumnName, 'by_value', '', columnConfigs, hotRef, checkedValues);
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

    const handleSearchValueChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleClearAllFilters = () => {
        columnConfigs.forEach((col, index) => {
            handleFilter(col.data, 'none', '', columnConfigs, hotRef, []);
        });

        setFilterCondition('none');
        setFilterValue('');
        setCheckedValues(allDistinctValues);
        setCheckedValues(allDistinctValues);
        setConfirmedSelectedColumn(null);
    };

    const toggleNotes = () => {
        setShowNotes(!showNotes);
    };

    useEffect(() => {
        fetchDistinctValues();
    }, [selectedColumnIndex, hotRef, fetchDistinctValues]);

    useEffect(() => {
        if (confirmedCheckedValues.length) {
            fetchDistinctValues();
        }
    }, [confirmedCheckedValues, fetchDistinctValues]);

    useEffect(() => {
        const lowercasedFilter = searchValue.toLowerCase();
        const newFilteredValues = allDistinctValues.filter(value =>
            value.toString().toLowerCase().includes(lowercasedFilter)
        );
        setFilteredValues(newFilteredValues);
    }, [searchValue, allDistinctValues]);

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
            You must first select a column to which the filter is applied. You can select a column in the main table on the left by clicking its head or selecting any cell within that column.
            </p>
            <p>
            <strong>Selected column:</strong> {selectedColumnIndex !== null ? `column ${selectedColumnIndex}, ${selectedColumnName}` : <span style={{ fontWeight: 'bold', color: 'red' }}>Please select a column</span>}
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
                When chosing how to filter your data, you have two options.
            </p>
            <p>
                <strong>- </strong>You can filter data by applying conditions such as equals, does not equal, contains, does not contain, etc.
            </p>
            <p>
                <strong>- </strong>You can manually select which data to filter out.
            </p>
            <div className={styles.separator}></div> {/* Add separator */}
            <p>
                <strong>Option 1: </strong>Select what condition the data in that column should fulfill to be visible:
            </p>
            <FilterConditionComponent
                filterCondition={filterCondition}
                filterValue={filterValue}
                handleFilterConditionChange={handleFilterConditionChange}
                handleFilterValueChange={handleFilterValueChange}
                handleFilterByConditionClick={handleFilterByConditionClick}
            />
            <p>
                <strong>Option 2: </strong>You can select manually what data from the selected column you want to hide:<br />
                <span style={{ fontSize: 14, color: 'grey' }}>
                    <span onClick={toggleNotes} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {showNotes ? 'Hide Notes' : 'Show Notes'}
                    </span>
                </span>
                {showNotes && (
                    <div style={{ fontSize: 14, color: 'grey' }}>
                        <p>- A checked box indicates that the value is displayed</p>
                        <p>- The "Clear All" and "Select All" buttons only affect the values currently being searched for.</p>
                    </div>
                )}
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
                You can apply different filters to different columns simultainously, here you can reset them all.
            </p>
            <div className="clear-all-filters">
                <button onClick={handleClearAllFilters} className={styles.applyButton}>
                    Reset all Filters
                </button>
            </div>
            <div className={styles.separator}></div> {/* Add separator */}
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
                        key={tableKey}
                        data={data}
                        colHeaders={columnConfigs.map((column) => column.title)}
                        columns={columnConfigs.map((col) => ({
                            ...col,
                            renderer: FilteredTableRenderer
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