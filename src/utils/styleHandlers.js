import { textRenderer } from 'handsontable/renderers/textRenderer';
import { TextStyleAction, CellStyleAction, ClearFormattingAction} from '../CustomUndoRedo';

export const handleStyleChange = (styleType, value, selectedCellsRef, setTextStyles, hotRef) => {
  const changes = [];
  const hotInstance = hotRef.current.hotInstance;

  setTextStyles((prev) => {
    const newTextStyles = { ...prev };
    selectedCellsRef.current.forEach(([row, col]) => {
      const visualRowIndex = hotInstance.toPhysicalRow(row);
      const visualColIndex = hotInstance.toPhysicalColumn(col);
      const cellKey = `${visualRowIndex}-${visualColIndex}`;
      
      if (!newTextStyles[cellKey]) {
        newTextStyles[cellKey] = {};
      }
      const oldStyle = { ...newTextStyles[cellKey] };
      
      if (styleType === 'clear formatting') {
        newTextStyles[cellKey] = {};
      } else if (styleType === 'bold') {
        newTextStyles[cellKey].fontWeight = newTextStyles[cellKey].fontWeight === 'bold' ? 'normal' : 'bold';
      } else if (styleType === 'italic') {
        newTextStyles[cellKey].fontStyle = newTextStyles[cellKey].fontStyle === 'italic' ? 'normal' : 'italic';
      } else if (styleType === 'strikethrough') {
        newTextStyles[cellKey].textDecoration = newTextStyles[cellKey].textDecoration === 'line-through' ? 'none' : 'line-through';
      } else if (styleType === 'borderColor') {
        const minRow = Math.min(...selectedCellsRef.current.map(([row, _]) => row));
        const maxRow = Math.max(...selectedCellsRef.current.map(([row, _]) => row));
        const minCol = Math.min(...selectedCellsRef.current.map(([_, col]) => col));
        const maxCol = Math.max(...selectedCellsRef.current.map(([_, col]) => col));

        if (row === minRow) {
          newTextStyles[cellKey].borderTop = `2px solid ${value}`;
        }
        if (row === maxRow) {
          newTextStyles[cellKey].borderBottom = `2px solid ${value}`;
        }
        if (col === minCol) {
          newTextStyles[cellKey].borderLeft = `2px solid ${value}`;
        }
        if (col === maxCol) {
          newTextStyles[cellKey].borderRight = `2px solid ${value}`;
        }
      } else {
        newTextStyles[cellKey][styleType] = value;
      }
      
      changes.push({ row: visualRowIndex, col: visualColIndex, oldStyle, newStyle: { ...newTextStyles[cellKey] } });
    });
    return newTextStyles;
  });

  const action = styleType === 'clear formatting'
    ? new ClearFormattingAction(changes)
    : styleType === 'backgroundColor' || styleType.includes('border')
    ? new CellStyleAction(changes)
    : new TextStyleAction(changes);

  hotInstance.undoRedo.done(() => action);
};

export const customRenderer = (instance, td, row, col, prop, value, cellProperties, textStyles) => {
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
