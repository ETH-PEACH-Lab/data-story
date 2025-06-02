import { useEffect } from 'react';

const CursorLayer = ({ awarenessStates }) => {
  useEffect(() => {
    const cursorLayer = document.getElementById('cursor-layer');
    if (!cursorLayer) return;

    // Clear old cursors
    cursorLayer.innerHTML = '';

    // Render each remote user's cursor
    awarenessStates.forEach((state, clientId) => {
      const { cursor } = state;
      if (!cursor) return;

      const cursorElement = document.createElement('div');
      cursorElement.className = 'cursor';
      cursorElement.style.position = 'absolute';
      cursorElement.style.left = `${cursor.x}px`;
      cursorElement.style.top = `${cursor.y}px`;
      cursorElement.style.width = '15px';
      cursorElement.style.height = '15px';
      cursorElement.style.borderRadius = '50%';
      cursorElement.style.backgroundColor = cursor.color || 'gray';
      cursorElement.style.zIndex = 1000;

      cursorLayer.appendChild(cursorElement);
    });
  }, [awarenessStates]);

  return (
    <div
      id="cursor-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

export default CursorLayer;
