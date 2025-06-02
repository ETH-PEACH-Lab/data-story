// mouseMoveHandlers.js

export function handleMouseMove(event, awarenessRef) {
  const x = event.clientX;
  const y = event.clientY;

  const currentLocalState = awarenessRef.current.getLocalState();
  const currentCursorState = currentLocalState?.cursor || {};

  awarenessRef.current.setLocalStateField('cursor', {
    x,
    y,
    color: currentCursorState.color,
  });
}
