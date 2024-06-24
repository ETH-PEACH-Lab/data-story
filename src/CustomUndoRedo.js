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

class TextStyleAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class CellStyleAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class TypeAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class HeadersAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class ConditionalFormattingAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class ClearFormattingAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class InsertRowAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class InsertColumnAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class ChartAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

//Necessary?
class FunctionAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class CommentAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class SortAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}

class FilterAction extends Handsontable.plugins.UndoRedo.Action {
    //TODO
}
