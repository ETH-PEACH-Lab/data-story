export const handleSort = (columnName, sortOrder, columnConfigs, hotRef) => {
  if (!columnName || !sortOrder) return;

  const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
  if (columnIndex === -1) return;

  const hotInstance = hotRef.current.hotInstance;
  const columnSorting = hotInstance.getPlugin('columnSorting');

  columnSorting.sort({
    column: columnIndex,
    sortOrder: sortOrder === 'Ascending' ? 'asc' : 'desc',
  });
};

export const handleFilter = (columnName, condition, value, columnConfigs, hotRef, checkedValues) => {
  if (!columnName || !condition) return;

  const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
  if (columnIndex === -1) return;

  const hotInstance = hotRef.current.hotInstance;
  const filtersPlugin = hotInstance.getPlugin('filters');

  filtersPlugin.clearConditions(columnIndex);

  if (condition === 'by_value') {
    filtersPlugin.addCondition(columnIndex, condition, [checkedValues]);
  } else {
    filtersPlugin.addCondition(columnIndex, condition, [value]);
  }
  
  filtersPlugin.filter();
};
