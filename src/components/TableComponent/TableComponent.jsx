import React, { useState, useContext, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { HyperFormula } from 'hyperformula';
import 'handsontable/dist/handsontable.full.min.css';
import './TableComponent.css';
import Toolbar from './Toolbar';

import {
	handleSelectionEnd,
	insertRow,
	insertColumn,
} from '../../utils/rowColumnHandlers';
import { customRenderer } from '../../utils/styleHandlers';
import { SharedContext, BrushState } from '../../App';
import { getAllDependents } from '../../utils/dataHandlers';

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
	brushState,
	entryId
}) => {
	const [selectedRange, setSelectedRangeState] = useState(null);
	const [activeItem, setActiveItem] = useState("");
	const [activeMenu, setActiveMenu] = useState("");
	const [rawValue, setRawValue] = useState('');
	const [selectedProp, setSelectedProp] = useState('');
	const [clipboard, setClipboard] = useState("");

	const {
		updateCols,
		updateTable,
		cellDiff,
		cellDeepDiff,
		historyActions,
		cellFormat,
		brushedCells,
		setBrushedCells,
	} = useContext(SharedContext);
	const handleSaveCurrentVersion = historyActions.handleSaveCurrentVersion;
	const addLogEntry = historyActions.addLogEntry

	const handleTableChange = (changes, source) => {
		if (source === 'loadData' || !changes) return;

		const hasChanges = changes.some(([, , oldValue, newValue]) => newValue !== oldValue)
		if (!hasChanges) return
		const engine = hotRef.current.hotInstance.getPlugin('formulas')?.engine;

		const newData = [...data];
		const deepChanges = []
		changes.forEach(([row, prop, oldValue, newValue]) => {
			newData[row][prop] = newValue;
			const col = hotRef.current.hotInstance.propToCol(prop);
			if (newValue?.startsWith("=")) deepChanges.push({ row, column: col, type: 'dependency' })
			else deepChanges.push({ row, column: col, type: 'content' })
			// const destinations = engine.getCellDependents({ sheet: 0, row, col })
			// deepChanges.push(...destinations.map(dest => ({ row: dest.row, column: dest.col, type: 'propagation' })))
			getAllDependents(engine, { sheet: 0, row, col }, deepChanges, 1)
		});

		if (changes.length > 0) {
			setData(newData);
			const histMsg = String(changes[0][3]).startsWith("=")
				? "Formula has been updated"
				: "Table data has been updated";
			addLogEntry(histMsg, selectedCellsRef.current, {}, deepChanges)
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

	const cellClassFn = (row, col) => {
		let diffString = '';
		if (cellDeepDiff && cellDeepDiff.length > 0) {
			const match = cellDeepDiff.find(cell => cell.row === row && cell.column === col);
			diffString = match ? `bg-${match.type}` : ''
		} else {
			diffString = cellDiff.has(`${row},${col}`) ? "bg-success diff-cell" : ""
		}

		const formatString = (cellFormat[`${row},${col}`]?.italic ? 'font-italic ' : '')
			+ (cellFormat[`${row},${col}`]?.bold ? 'font-bold ' : '')
			+ (cellFormat[`${row},${col}`]?.bg ?? "")
		const brushString = brushedCells.some(cell => cell[0] === row && cell[1] === col) ? 'bg-warning brushed ' : '';

		const highlightCells = window.deepTraceMap || [];
		const highlight = highlightCells.find(item => item.id === entryId);

		const isHighlighted = highlight?.cells?.some(cell => cell.row === row && cell.col === col);

		const brushedString = isHighlighted ? 'brushed ' : '';
		if (cellDiff.size > 0) return { className: brushedString + diffString }
		else if (brushState === BrushState.BRUSHING) return { className: (brushString + "brushing") }
		else if (brushState === BrushState.BRUSHED) return { className: brushedString }
		else return { className: formatString }
	}

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

	const handleCopy = (e) => {
		if (!e.ctrlKey || e.key !== 'c') return
		if (selectedCellsRef.current.length === 0) return
		setClipboard(rawValue)
	}

	const handlePaste = (e) => {
		if (!e.ctrlKey || e.key !== 'v') return
		const row = selectedCellsRef.current[0][0]
		handleTableChange([[row, selectedProp, rawValue, clipboard]], "edit")
	}

	useEffect(() => {
		document.addEventListener("keydown", handleCopy)
		document.addEventListener("keydown", handlePaste)
		return () => {
			document.removeEventListener("keydown", handleCopy)
			document.removeEventListener("keydown", handlePaste)
		}
	}, [rawValue, clipboard, selectedCellsRef, selectedProp]);

	useEffect(() => {
		if (hotRef?.current?.hotInstance) {
			const selected = hotRef.current.hotInstance.getSelectedLast();
			if (selected) {
				const [row, col] = selected;
				const columnKeys = Object.keys(data[0]);
				const value = data[row][columnKeys[col]];
				setRawValue(value ?? '');
			}
		}
	}, [data, hotRef])

	const handleSelection = (r1, c1) => {
		if (brushState !== BrushState.BRUSHING) return
		const newCells = brushedCells.some((cell => cell[0] === r1 && cell[1] === c1)) ?
			brushedCells.filter(cell => !(cell[0] === r1 && cell[1] === c1)) :
			[...brushedCells, [r1, c1]];
		setBrushedCells(newCells)
	}

	return (
		<SharedContext.Provider value={{
			activeMenu, setActiveMenu,
			activeItem, setActiveItem,
			...useContext(SharedContext) // only if needed
		}}>
			<div className='table-content-area'>
				<div className='handsontable-container' ref={tableContainerRef}>
					<div className='hot-table-wrapper'>
						<Toolbar
							data={data}
							rawValue={rawValue}
							setRawValue={setRawValue}
							selectedProp={selectedProp}
							handleTableChange={handleTableChange}
						/>
						<HotTable
							formulas={{
								engine: HyperFormula, // ✅ this is correct
								sheetName: 'Formulas',
							}}
							ref={hotRef}
							data={data}
							colHeaders
							colWidths={100}
							cells={cellClassFn}
							rowHeaders
							width='100%'
							height='100%'
							autoWrapRow
							autoWrapCol
							columnSorting
							filters
							manualColumnResize
							afterSelection={handleSelection}
							afterSelectionEnd={(r1, c1, r2, c2) => {
								const engine = hotRef.current.hotInstance.getPlugin('formulas')?.engine;
								const serialized = engine.getCellSerialized({ sheet: 0, row: r1, col: c1 });
								const fallback = hotRef.current.hotInstance.getDataAtCell(r1, c1);

								//TODO: Can not display serialized value
								handleSelectionEnd(r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex, setSelectedRangeState, hotRef)
							}
							}
							afterSelectionEndByProp={(r, prop1) => {
								setRawValue(data[r][prop1] ?? '');
								setSelectedProp(prop1)
							}}
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
