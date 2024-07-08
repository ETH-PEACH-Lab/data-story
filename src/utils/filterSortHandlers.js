import { SortAction } from '../CustomUndoRedo';

export const handleSort = (columnName, sortOrder, columnConfigs, hotRef) => {
  if (!columnName || !sortOrder) return;

  const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
  if (columnIndex === -1) return;

  const hotInstance = hotRef.current.hotInstance;
  const sortPlugin = hotInstance.getPlugin('columnSorting');

  const previousSortConfig = sortPlugin.getSortConfig().slice();
  const newSortConfig = [{
    column: columnIndex,
    sortOrder: sortOrder === 'Ascending' ? 'asc' : 'desc'
  }];

  sortPlugin.sort(newSortConfig);

  // Record the SortAction for undo/redo
  const wrappedAction = () => new SortAction(previousSortConfig, newSortConfig);
  hotInstance.undoRedo.done(wrappedAction);

  hotInstance.render();
};

export const handleFilter = (
  columnIndex,
  condition,
  value,
  hotRef,
  checkedValues,
  filteredColumns,
  setFilteredColumns
) => {
  if (columnIndex === undefined || columnIndex === null) return;

  const hotInstance = hotRef.current?.hotInstance;
  if (!hotInstance) {
    console.error("Handsontable instance not found.");
    return;
  }

  const filtersPlugin = hotInstance.getPlugin('filters');
  filtersPlugin.clearConditions(columnIndex);

  const allDistinctValues = [...new Set(hotInstance.getSourceDataAtCol(columnIndex).map(value => (value !== null && value !== undefined ? value : '')))];
  
  if (condition === 'by_value') {
    if (checkedValues.length === 0 || checkedValues.length < allDistinctValues.length) {
      filtersPlugin.addCondition(columnIndex, condition, [checkedValues]);
      filteredColumns[columnIndex] = true;
    } else {
      filteredColumns[columnIndex] = false;
    }
  } else if (condition === 'none') {
    filteredColumns[columnIndex] = false;
  } else {
    filtersPlugin.addCondition(columnIndex, condition, [value]);
    filteredColumns[columnIndex] = true;
  }

  filtersPlugin.filter();
  setFilteredColumns([...filteredColumns]);
};
