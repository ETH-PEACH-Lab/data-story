import React, { useState, useContext } from 'react';
import { HotTable } from '@handsontable/react';
import { HyperFormula } from 'hyperformula';
import 'handsontable/dist/handsontable.full.min.css';
import './TableComponent.css';
import Toolbar  from './Toolbar';

import {
	handleSelectionEnd,
	insertRow,
	insertColumn,
} from '../../utils/rowColumnHandlers';
import { customRenderer } from '../../utils/styleHandlers';
import { SharedContext } from '../../App';

const TableComponent = ({
	data,
	setData,
	columnConfigs,
	setColumnConfigs,
	setSelectedColumnIndex,
	textStyles,
	hotRef,
	selectedCellsRef,
	tableContainerRef,
}) => {
	const [selectedRange, setSelectedRangeState] = useState(null);
	const [activeItem, setActiveItem] = useState("");
	const [activeMenu, setActiveMenu] = useState("");
	const [rawValue, setRawValue] = useState('');


	const {
		updateCols, updateTable, cellDiff, historyActions
	} = useContext(SharedContext);
	const handleSaveCurrentVersion = historyActions.handleSaveCurrentVersion;

	const handleTableChange = (changes, source) => {
		if (source === 'loadData' || !changes) return;

		const newData = [...data];
		changes.forEach(([row, prop, oldValue, newValue]) => {
			newData[row][prop] = newValue;
			const col = hotRef.current.hotInstance.propToCol(prop);
			hotRef.current.hotInstance.getPlugin('formulas').engine.setCellContents(
				{ sheet: 0, col, row }, [[newValue]]
			);
		});

		if (changes.length > 0) {
			setData(newData);
			const histMsg = String(changes[0][3]).startsWith("=")
				? "Formula has been updated"
				: "Table data has been updated";
			handleSaveCurrentVersion(histMsg);
			updateTable(newData);
		}
	};

	const applyStyle = (type) => {
		const plugin = hotRef.current.hotInstance.getPlugin('customBorders'); // or your own style logic

		const selected = hotRef.current.hotInstance.getSelectedLast();
		if (!selected) return;

		const [rowStart, colStart, rowEnd, colEnd] = selected;

		for (let r = rowStart; r <= rowEnd; r++) {
			for (let c = colStart; c <= colEnd; c++) {
				const meta = hotRef.current.hotInstance.getCellMeta(r, c);

				if (type === 'bold') {
					meta.className = (meta.className || '') + ' bold';
				}

				if (type === 'italic') {
					meta.className = (meta.className || '') + ' italic';
				}

				// You can implement background or font color similarly
			}
		}

		hotRef.current.hotInstance.render();
	};


	const columns = columnConfigs.map((col) => ({
		...col,
		renderer: (instance, td, row, col, prop, value, cellProps) =>
			customRenderer(instance, td, row, col, prop, value, cellProps),
	}));

	const cellClassFn = (row, col) => ({
		className: cellDiff.has(`${row},${col}`) ? "bg-success" : ""
	});

	const contextMenuItems = {
		insert_row_above: {
			name: 'Insert row above',
			callback: (_, selection) => {
				insertRow(data, setData, columnConfigs, hotRef, handleSaveCurrentVersion, updateTable, selection[0].start.row);
			}
		},
		insert_row_below: {
			name: 'Insert row below',
			callback: (_, selection) => {
				insertRow(data, setData, columnConfigs, hotRef, handleSaveCurrentVersion, updateTable, selection[0].end.row + 1);
			}
		},
		sep1: "---------",
		insert_col_left: {
			name: 'Insert column left',
			callback: (_, selection) => {
				insertColumn(data, setData, columnConfigs, setColumnConfigs, hotRef, handleSaveCurrentVersion, updateTable, updateCols, selection[0].start.col);
			}
		},
		insert_col_right: {
			name: 'Insert column right',
			callback: (_, selection) => {
				insertColumn(data, setData, columnConfigs, setColumnConfigs, hotRef, handleSaveCurrentVersion, updateTable, updateCols, selection[0].end.col + 1);
			}
		},
		sep2: "---------",
		clear_cells: {
			name: 'Clear all cells',
			callback: function () {
				this.clear();
			}
		},
		rename_col: {
			name: 'Rename column',
			callback: () => {
				setActiveMenu("Edit");
				setActiveItem("Headers");
			}
		}
	};

	return (
		<SharedContext.Provider value={{
			activeMenu, setActiveMenu,
			activeItem, setActiveItem,
			...useContext(SharedContext) // only if needed
		}}>
			<div className='table-content-area'>
				<div className='handsontable-container' ref={tableContainerRef}>
					<div className='hot-table-wrapper'>
						<Toolbar rawValue={rawValue} />
						<HotTable
							formulas={{
								engine: HyperFormula, // ✅ this is correct
							}}
							ref={hotRef}
							data={data}
							colHeaders
							columns={columns}
							cells={cellClassFn}
							rowHeaders
							width='100%'
							height='100%'
							autoWrapRow
							autoWrapCol
							columnSorting
							filters
							manualColumnResize
							afterSelectionEnd={(r1, c1, r2, c2) => {
								const engine = hotRef.current.hotInstance.getPlugin('formulas')?.engine;
								const serialized = engine.getCellSerialized({ sheet: 0, row: r1, col: c1 });
								const fallback = hotRef.current.hotInstance.getDataAtCell(r1, c1);

								//TODO: Can not display serialized value
								setRawValue(serialized ?? fallback ?? '');
								handleSelectionEnd(r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex, setSelectedRangeState, hotRef)
							}
							}
							beforeColumnResize={(newSize) => newSize > 300 ? 300 : newSize}
							outsideClickDeselects={false}
							fillHandle
							comments
							licenseKey='non-commercial-and-evaluation'
							undoRedo
							settings={{ textStyles }}
							autoColumnSize={{ syncLimit: 300 }}
							modifyColWidth={(width) => width > 300 ? 300 : width}
							afterChange={handleTableChange}
							contextMenu={{ items: contextMenuItems }}
						/>
					</div>
				</div>
			</div>
		</SharedContext.Provider>
	);
};

export default TableComponent;
