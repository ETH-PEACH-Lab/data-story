import { textRenderer } from 'handsontable/renderers/textRenderer';
import { TextStyleAction, CellStyleAction, ClearFormattingAction} from '../CustomUndoRedo';

export const handleStyleChange = (styleType, value, selectedCellsRef, setTextStyles, hotRef) => {
  const changes = [];
  setTextStyles((prev) => {
    const newTextStyles = { ...prev };
    selectedCellsRef.current.forEach(([row, col]) => {
      if (!newTextStyles[`${row}-${col}`]) {
        newTextStyles[`${row}-${col}`] = {};
      }
      const oldStyle = { ...newTextStyles[`${row}-${col}`] };
      if (styleType === 'clear formatting') {
        newTextStyles[`${row}-${col}`] = {};
      } else if (styleType === 'bold') {
        newTextStyles[`${row}-${col}`].fontWeight = newTextStyles[`${row}-${col}`].fontWeight === 'bold' ? 'normal' : 'bold';
      } else if (styleType === 'italic') {
        newTextStyles[`${row}-${col}`].fontStyle = newTextStyles[`${row}-${col}`].fontStyle === 'italic' ? 'normal' : 'italic';
      } else if (styleType === 'strikethrough') {
        newTextStyles[`${row}-${col}`].textDecoration = newTextStyles[`${row}-${col}`].textDecoration === 'line-through' ? 'none' : 'line-through';
      } else if (styleType === 'borderColor') {
        const minRow = Math.min(...selectedCellsRef.current.map(([row, _]) => row));
        const maxRow = Math.max(...selectedCellsRef.current.map(([row, _]) => row));
        const minCol = Math.min(...selectedCellsRef.current.map(([_, col]) => col));
        const maxCol = Math.max(...selectedCellsRef.current.map(([_, col]) => col));

        if (row === minRow) {
          newTextStyles[`${row}-${col}`].borderTop = `2px solid ${value}`;
        }
        if (row === maxRow) {
          newTextStyles[`${row}-${col}`].borderBottom = `2px solid ${value}`;
        }
        if (col === minCol) {
          newTextStyles[`${row}-${col}`].borderLeft = `2px solid ${value}`;
        }
        if (col === maxCol) {
          newTextStyles[`${row}-${col}`].borderRight = `2px solid ${value}`;
        }
      } else {
        newTextStyles[`${row}-${col}`][styleType] = value;
      }
      changes.push({ row, col, oldStyle, newStyle: { ...newTextStyles[`${row}-${col}`] } });
      console.log(`Modified cell [${row}, ${col}] from style:`, oldStyle, "to style:", newTextStyles[`${row}-${col}`]);
    });
    return newTextStyles;
  });

  const action = styleType === 'clear formatting'
    ? new ClearFormattingAction(changes)
    : styleType === 'backgroundColor' || styleType.includes('border')
    ? new CellStyleAction(changes)
    : new TextStyleAction(changes);

  hotRef.current.hotInstance.undoRedo.done(() => action);
};

export const customRenderer = (instance, td, row, col, prop, value, cellProperties, textStyles) => {
  textRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  const cellKey = `${row}-${col}`;
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
