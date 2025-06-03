import { SortAction, FilterAction } from '../CustomUndoRedo';

export const handleSort = (columnName, sortOrder, columnConfigs, hotRef, handleSaveCurrentVersion) => {
  const hotInstance = hotRef.current.hotInstance;
  const sortPlugin = hotInstance.getPlugin('columnSorting');

  if (sortOrder === 'reset') {
    const previousSortConfig = sortPlugin.getSortConfig().slice();

    sortPlugin.clearSort();
    hotInstance.render();
    handleSaveCurrentVersion("Sortings on the table is reset");
    //*#*//

    // const wrappedAction = () => new SortAction(previousSortConfig, []);
    // hotInstance.undoRedo.done(wrappedAction);

    return;
  }

  if (!columnName || !sortOrder) return;

  const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
  if (columnIndex === -1) return;

  const previousSortConfig = sortPlugin.getSortConfig().slice();
  const newSortConfig = [{
    column: columnIndex,
    sortOrder: sortOrder === 'Ascending' ? 'asc' : 'desc'
  }];

  sortPlugin.sort(newSortConfig);
  handleSaveCurrentVersion("Column " + (columnIndex + 1) + " is sorted in the " + sortOrder + " order");
  //*#*//

  // const wrappedAction = () => new SortAction(previousSortConfig, newSortConfig);
  // hotInstance.undoRedo.done(wrappedAction);

  hotInstance.render();
};

export const handleFilter = (
  columnIndex,
  condition,
  value,
  hotRef,
  checkedValues,
  filteredColumns,
  handleSaveCurrentVersion
) => {
  if (columnIndex === undefined || columnIndex === null) return;

  const hotInstance = hotRef.current?.hotInstance;
  if (!hotInstance) {
    console.error("Handsontable instance not found.");
    return;
  }

  const filtersPlugin = hotInstance.getPlugin('filters');
  const previousConditionsStack = filtersPlugin.conditionCollection.exportAllConditions();
  const previousFilteredColumns = [...filteredColumns];
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
  const currentConditionsStack = filtersPlugin.conditionCollection.exportAllConditions();
  const currentFilteredColumns = [...filteredColumns];

  handleSaveCurrentVersion("New filter on column " + (columnIndex + 1) + " is added, condition: " + condition);
  //*#*//

  // hotInstance.undoRedo.done(wrappedAction);
  // console.log("!90 filtersorthandlers.js", hotInstance.undoRedo.doneActions);
};
