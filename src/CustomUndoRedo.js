import Handsontable from 'handsontable';

class FindReplaceAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(changes) {
    super();
    this.changes = changes; // Array of changes in the form: [{row, col, oldValue, newValue}]
    this.actionType = 'find_replace';
  }

  undo(instance, undoneCallback) {
    console.log('Undo changes:', this.changes);
    const changes = this.changes.map(change => [change.row, change.col, change.oldValue]);
    instance.setDataAtCell(changes, null, null, 'UndoRedo.undo');
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    console.log('Redo changes:', this.changes);
    const changes = this.changes.map(change => [change.row, change.col, change.newValue]);
    instance.setDataAtCell(changes, null, null, 'UndoRedo.redo');
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}

export { FindReplaceAction };

class RemoveDuplicatesAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(removedIndices, removedData, rowIndexesSequence) {
    super();
    this.removedIndices = removedIndices;
    this.removedData = removedData;
    this.rowIndexesSequence = rowIndexesSequence;
    this.actionType = 'remove_duplicates';
  }

  undo(instance, undoneCallback) {
    console.log('Undo remove duplicates:', this.removedIndices, this.removedData);
    const settings = instance.getSettings();
    const changes = [];

    this.removedIndices.forEach((index, i) => {
      instance.alter('insert_row_above', index, 1, 'UndoRedo.undo');
      Object.keys(this.removedData[i]).forEach((columnProp) => {
        const columnIndex = parseInt(columnProp, 10);
        changes.push([index, isNaN(columnIndex) ? columnProp : columnIndex, this.removedData[i][columnProp]]);
      });
    });

    instance.addHookOnce('afterViewRender', undoneCallback);

    instance.setSourceDataAtCell(changes, null, null, 'UndoRedo.undo');
    instance.rowIndexMapper.setIndexesSequence(this.rowIndexesSequence);
    instance.render();
  }

  redo(instance, redoneCallback) {
    console.log('Redo remove duplicates:', this.removedIndices);
    instance.addHookOnce('afterRemoveRow', redoneCallback);
    this.removedIndices.forEach(index => {
      instance.alter('remove_row', index, 1, 'UndoRedo.redo');
    });
    instance.render();
  }
}

export { RemoveDuplicatesAction };

class TypeAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(columnIndex, oldType, newType) {
    super();
    this.columnIndex = columnIndex;
    this.oldType = oldType;
    this.newType = newType;
    this.actionType = 'change_type';
  }

  undo(instance, undoneCallback) {
    const columns = instance.getSettings().columns;
    columns[this.columnIndex].type = this.oldType;
    instance.updateSettings({ columns: columns });
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    const columns = instance.getSettings().columns;
    columns[this.columnIndex].type = this.newType;
    instance.updateSettings({ columns: columns });
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}
export { TypeAction };

class HeaderAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(columnIndex, oldHeader, newHeader) {
    super();
    this.columnIndex = columnIndex;
    this.oldHeader = oldHeader;
    this.newHeader = newHeader;
    this.actionType = 'change_header';
  }

  undo(instance, undoneCallback) {
    const columns = instance.getSettings().columns;
    columns[this.columnIndex].title = this.oldHeader;
    instance.updateSettings({ columns: columns });
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    const columns = instance.getSettings().columns;
    columns[this.columnIndex].title = this.newHeader;
    instance.updateSettings({ columns: columns });
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}
export { HeaderAction };

class InsertRowAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(index, amount) {
    super();
    this.index = index;
    this.amount = amount;
    this.actionType = 'insert_row';
  }

  undo(instance, undoneCallback) {
    instance.addHookOnce('afterRemoveRow', undoneCallback);
    instance.alter('remove_row', this.index, this.amount, 'UndoRedo.undo');
  }

  redo(instance, redoneCallback) {
    instance.addHookOnce('afterCreateRow', redoneCallback);
    instance.alter('insert_row_above', this.index, this.amount, 'UndoRedo.redo');
  }
}

export { InsertRowAction };

class InsertColumnAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(index, columnKey) {
    super();
    this.index = index;
    this.columnKey = columnKey;
    this.actionType = 'insert_col';
  }

  undo(instance, undoneCallback) {
    const columnConfigs = instance.getSettings().columns;
    columnConfigs.splice(this.index, 1);
    instance.updateSettings({ columns: columnConfigs });
    
    instance.getSourceData().forEach(row => {
      delete row[this.columnKey];
    });
    
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    const columnConfigs = instance.getSettings().columns;
    const newColumn = { data: this.columnKey, title: `Column ${this.index + 1}` };
    columnConfigs.splice(this.index, 0, newColumn);
    instance.updateSettings({ columns: columnConfigs });

    instance.getSourceData().forEach(row => {
      row[this.columnKey] = '';
    });
    
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}

export { InsertColumnAction };

class TextStyleAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(changes) {
    super();
    this.changes = changes; // Array of changes in the form: [{ row, col, oldStyle, newStyle }]
    this.actionType = 'text_style';
  }

  undo(instance, undoneCallback) {
    console.log('Undo text style changes:', this.changes);
    const textStyles = instance.getSettings().textStyles || {};
    this.changes.forEach(({ row, col, oldStyle }) => {
      const cellKey = `${row}-${col}`;
      textStyles[cellKey] = oldStyle;
      console.log(`Restoring cell [${row}, ${col}] to style:`, oldStyle);
    });
    instance.updateSettings({ textStyles });
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    console.log('Redo text style changes:', this.changes);
    const textStyles = instance.getSettings().textStyles || {};
    this.changes.forEach(({ row, col, newStyle }) => {
      const cellKey = `${row}-${col}`;
      textStyles[cellKey] = newStyle;
      console.log(`Applying new style to cell [${row}, ${col}]:`, newStyle);
    });
    instance.updateSettings({ textStyles });
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}

export { TextStyleAction };

class CellStyleAction extends Handsontable.plugins.UndoRedo.Action {
  constructor(changes) {
    super();
    this.changes = changes; // Array of changes in the form: [{ row, col, oldStyle, newStyle }]
    this.actionType = 'cell_style';
  }

  undo(instance, undoneCallback) {
    console.log('Undo cell style changes:', this.changes);
    const textStyles = instance.getSettings().textStyles || {};
    this.changes.forEach(({ row, col, oldStyle }) => {
      const cellKey = `${row}-${col}`;
      textStyles[cellKey] = oldStyle;
      console.log(`Restoring cell [${row}, ${col}] to style:`, oldStyle);
    });
    instance.updateSettings({ textStyles });
    instance.render();
    if (undoneCallback) {
      undoneCallback();
    }
  }

  redo(instance, redoneCallback) {
    console.log('Redo cell style changes:', this.changes);
    const textStyles = instance.getSettings().textStyles || {};
    this.changes.forEach(({ row, col, newStyle }) => {
      const cellKey = `${row}-${col}`;
      textStyles[cellKey] = newStyle;
      console.log(`Applying new style to cell [${row}, ${col}]:`, newStyle);
    });
    instance.updateSettings({ textStyles });
    instance.render();
    if (redoneCallback) {
      redoneCallback();
    }
  }
}

export { CellStyleAction };

class ClearFormattingAction extends Handsontable.plugins.UndoRedo.Action {
    constructor(changes) {
      super();
      this.changes = changes;
      this.actionType = 'clear_formatting';
    }
  
    undo(instance, undoneCallback) {
      console.log('Undo clear formatting:', this.changes);
      const textStyles = instance.getSettings().textStyles || {};
      this.changes.forEach(({ row, col, oldStyle }) => {
        const cellKey = `${row}-${col}`;
        textStyles[cellKey] = oldStyle;
        console.log(`Restoring cell [${row}, ${col}] to style:`, oldStyle);
      });
      instance.updateSettings({ textStyles });
      instance.render();
      if (undoneCallback) {
        undoneCallback();
      }
    }
  
    redo(instance, redoneCallback) {
      console.log('Redo clear formatting:', this.changes);
      const textStyles = instance.getSettings().textStyles || {};
      this.changes.forEach(({ row, col }) => {
        const cellKey = `${row}-${col}`;
        textStyles[cellKey] = {};
        console.log(`Clearing style for cell [${row}, ${col}]`);
      });
      instance.updateSettings({ textStyles });
      instance.render();
      if (redoneCallback) {
        redoneCallback();
      }
    }
  }
  
  export { ClearFormattingAction };

  class SortAction extends Handsontable.plugins.UndoRedo.Action {
    constructor(previousSortConfig, currentSortConfig) {
      super();
      this.previousSortConfig = previousSortConfig;
      this.currentSortConfig = currentSortConfig;
      this.actionType = 'sort';
    }
  
    undo(instance, undoneCallback) {
      const sortPlugin = instance.getPlugin('columnSorting');
      sortPlugin.clearSort();
  
      if (this.previousSortConfig.length) {
        sortPlugin.sort(this.previousSortConfig);
      }
      
      instance.render();
      if (undoneCallback) {
        undoneCallback();
      }
    }
  
    redo(instance, redoneCallback) {
      const sortPlugin = instance.getPlugin('columnSorting');
      sortPlugin.clearSort();
  
      if (this.currentSortConfig.length) {
        sortPlugin.sort(this.currentSortConfig);
      }
      
      instance.render();
      if (redoneCallback) {
        redoneCallback();
      }
    }
  }
  
  export { SortAction };
