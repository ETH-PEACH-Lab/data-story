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
  
  export const handleFilter = (columnName, condition, value, columnConfigs, hotRef) => {
    if (!columnName || !condition) return;
  
    const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
    if (columnIndex === -1) return;
  
    const hotInstance = hotRef.current.hotInstance;
    const filtersPlugin = hotInstance.getPlugin('filters');
  
    if (condition === 'clear') {
      filtersPlugin.removeConditions(columnIndex);
      filtersPlugin.filter();
    } else {
      filtersPlugin.clearConditions(columnIndex);
      filtersPlugin.addCondition(columnIndex, condition, [value]);
      filtersPlugin.filter();
    }
  };
  