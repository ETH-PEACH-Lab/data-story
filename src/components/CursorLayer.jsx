import React, { useEffect } from 'react';
import { useAwareness } from '../hooks/useAwareness';

const CursorLayer = ({ awareness }) => {
    const awarenessStates = useAwareness(awareness)

    useEffect(() => {
        if (!awareness) return;

        const handleMouseMove = (event) => {
            const current = awareness.getLocalState() || {};
            const color = current.cursor?.color || 'blue';

            awareness.setLocalStateField('cursor', {
                x: event.clientX,
                y: event.clientY,
                color,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [awareness]);

    useEffect(() => {
        const cursorLayer = document.getElementById('cursor-layer');
        if (!cursorLayer) return;

        // Clear existing cursors
        cursorLayer.innerHTML = '';

        awarenessStates.forEach((state, clientId) => {
            const { cursor } = state;
            if (cursor) {
                const cursorElement = document.createElement('div');
                cursorElement.className = 'cursor';
                cursorElement.style.position = 'absolute';
                cursorElement.style.left = `${cursor.x}px`;
                cursorElement.style.top = `${cursor.y}px`;
                cursorElement.style.width = '12px';
                cursorElement.style.height = '12px';
                cursorElement.style.backgroundColor = cursor.color || 'blue';
                cursorElement.style.borderRadius = '50%';
                cursorElement.style.zIndex = 1000;

                cursorLayer.appendChild(cursorElement);
            }
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