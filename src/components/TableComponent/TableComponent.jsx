import React, { useState, useContext } from 'react'
import { HotTable } from '@handsontable/react'
import { HyperFormula } from 'hyperformula';
import 'handsontable/dist/handsontable.full.min.css'
import {
	handleSelectionEnd,
	addRow,
	insertRow,
	addColumn,
	insertColumn,
	removeColumn,
} from '../../utils/rowColumnHandlers'
import { customRenderer } from '../../utils/styleHandlers'
import { SharedContext } from '../../App'
import "./TableComponent.css";

const TableComponent = ({
	setStartEdit,
	data,
	setData,
	columnConfigs,
	setColumnConfigs,
	setSelectedColumnIndex,
	textStyles,
	filteredColumns,
	hotRef,
	selectedCellsRef,
	tableContainerRef,
}) => {
	const [selectedRange, setSelectedRangeState] = useState(null)
	const [activeItem, setActiveItem] = useState("");
	const [activeMenu, setActiveMenu] = useState("");

	const { updateCols, updateHist, updateTable, cellDiff, handleSaveCurrentVersion } = useContext(SharedContext)

	const handleTableChange = (changes, source) => {
		if (source === 'loadData' || !changes) return

		const newData = [...data]

		// Apply the changes made to the table to the newData array
		changes.forEach(([row, prop, oldValue, newValue]) => {
			newData[row][prop] = newValue
			console.log('changes: ', row, prop, oldValue, newValue)
			const col = hotRef.current.hotInstance.propToCol(prop)
			hotRef.current.hotInstance.getPlugin('formulas').engine.setCellContents({ sheet: 0, col: col, row: row }, [[newValue]])
		})

		// Update if there are any actual changes
		if (changes.length > 0) {
			console.log('Updating local state and pushing changes to Yjs')
			setData(newData)
			const histMsg = String(changes[0][3]).startsWith("=") ? "Formula has been updated" : "Table data has been updated"
			handleSaveCurrentVersion(histMsg)
			//*#*//

			// Push the updated data to Yjs for real-time sync
			updateTable(newData)
		}

		setStartEdit(true)
	}

	return (
		<SharedContext.Provider value={{ ...useContext(SharedContext), activeMenu, setActiveMenu, activeItem, setActiveItem }}>
			<div className='table-content-area'>
				<div
					className='handsontable-container'
					ref={tableContainerRef}
				>
					<div className='hot-table-wrapper'>
						<HotTable
							ref={hotRef}
							data={data}
							colHeaders
							columns={columnConfigs.map((col) => ({
								...col,
								renderer: (instance, td, row, col, prop, value, cellProperties) =>
									customRenderer(
										instance,
										td,
										row,
										col,
										prop,
										value,
										cellProperties
									),
							}))}
							cells={
								(row, col) => ({ className: cellDiff.has(row + "," + col) ? "bg-success" : "" })
							}
							rowHeaders
							width='100%'
							height='100%'
							autoWrapRow
							autoWrapCol
							columnSorting
							filters
							manualColumnResize
							afterSelectionEnd={(r1, c1, r2, c2) =>
								handleSelectionEnd(
									r1,
									c1,
									r2,
									c2,
									selectedCellsRef,
									setSelectedColumnIndex,
									setSelectedRangeState,
									hotRef
								)
							}
							selectionMode='range'
							afterGetColHeader={(col, TH) => {
								const headerLevel =
									-1 * TH.parentNode.parentNode.childNodes.length +
									Array.prototype.indexOf.call(
										TH.parentNode.parentNode.childNodes,
										TH.parentNode
									)
								if (headerLevel === -1 && filteredColumns[col])
									TH.classList.add('green-header')
							}}
							beforeColumnResize={(newSize, column, isDoubleClick) => {
								if (newSize > 300) {
									return 300
								}
							}}
							outsideClickDeselects={false}
							fillHandle
							comments
							licenseKey='non-commercial-and-evaluation'
							undoRedo
							settings={{ textStyles }}
							autoColumnSize={{ syncLimit: 300 }}
							modifyColWidth={(width, col) => {
								if (width > 300) {
									return 300
								}
								return width
							}}
							afterChange={handleTableChange}
							contextMenu={{
								items: {
									insert_row_above: {
										name: 'Insert row above',
										callback(_, selection) {
											const idx = selection[0].start.row
											insertRow(data, setData, columnConfigs, hotRef, handleSaveCurrentVersion, updateTable, idx)
										},
									},
									insert_row_below: {
										name: 'Insert row below',
										callback(_, selection) {
											const idx = selection[0].end.row + 1
											insertRow(data, setData, columnConfigs, hotRef, handleSaveCurrentVersion, updateTable, idx)
										},
									},
									sep1: "---------",
									insert_col_left: {
										name: 'Insert column left',
										callback(_, selection) {
											const idx = selection[0].start.col
											insertColumn(data, setData, columnConfigs, setColumnConfigs, hotRef, handleSaveCurrentVersion, updateTable, updateCols, idx)
										},
									},
									insert_col_right: {
										name: 'Insert column right',
										callback(_, selection) {
											const idx = selection[0].end.col + 1
											insertColumn(data, setData, columnConfigs, setColumnConfigs, hotRef, handleSaveCurrentVersion, updateTable, updateCols, idx)
										},
									},
									sep2: "---------",
									clear_cells: {
										name: 'Clear all cells',
										callback() {
											this.clear();
										},
									},
									rename_col: {
										name: 'Rename column',
										callback() {
											setActiveMenu("Edit")
											setActiveItem("Headers")
										},
									},
								},
							}}
							formulas={{
								engine: HyperFormula,
							}}
						/>
					</div>
				</div>
			</div>
		</SharedContext.Provider>
	)
}

export default TableComponent
