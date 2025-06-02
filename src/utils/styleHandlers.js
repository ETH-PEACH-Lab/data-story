import { textRenderer } from 'handsontable/renderers/textRenderer';
import { TextStyleAction, CellStyleAction, ClearFormattingAction } from '../CustomUndoRedo';

export const handleStyleChange = (styleType, hotRef, handleSaveCurrentVersion) => {
  const changes = [];
  const hotInstance = hotRef.current.hotInstance;

  const action = styleType === "clear formatting"
    ? new ClearFormattingAction(changes)
    : styleType === "backgroundColor" || styleType.includes("border")
      ? new CellStyleAction(changes)
      : new TextStyleAction(changes);
  hotInstance.undoRedo.done(() => action);
  handleSaveCurrentVersion("Table's style has changed: " + styleType);
  //*#*//
};

export const customRenderer = (instance, td, row, col, prop, value, cellProperties, textStyles={}) => {
  textRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  const visualRowIndex = instance.toPhysicalRow(row);
  const visualColIndex = instance.toPhysicalColumn(col);
  const cellKey = `${visualRowIndex}-${visualColIndex}`;
  const styles = textStyles[cellKey] || {};

  td.style.color = styles.color || 'black';
  td.style.backgroundColor = styles.backgroundColor || 'white';
  td.style.fontWeight = styles.fontWeight || 'normal';
  td.style.fontStyle = styles.fontStyle || 'normal';
  td.style.textDecoration = styles.textDecoration || 'none';
  td.style.borderTop = styles.borderTop || ''; 
  td.style.borderBottom = styles.borderBottom || '';
  td.style.borderLeft = styles.borderLeft || '';
  td.style.borderRight = styles.borderRight || '';
};
