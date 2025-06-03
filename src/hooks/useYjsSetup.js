// ./hooks/useYjsSetup.js
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjsSetup({ roomName, onSynced, onSharedHistoryUpdate }) {
  const doc = useRef(new Y.Doc());
  const provider = useRef(null);
  const awareness = useRef(null);

  const sharedArray = useRef(doc.current.getArray('tableData3'));
  const sharedStoryPanel = useRef(doc.current.getArray('storyPanelData'));
  const sharedHist = useRef(doc.current.getArray('history'));
  const sharedCols = useRef(doc.current.getArray('columnConfigs'));

  // ✅ Track latest onSharedHistoryUpdate
  const onSharedHistoryUpdateRef = useRef(onSharedHistoryUpdate);
  useEffect(() => {
    onSharedHistoryUpdateRef.current = onSharedHistoryUpdate;
  }, [onSharedHistoryUpdate]);

  const getLatestState = () => ({
    table: sharedArray.current.toJSON(),             
    story: sharedStoryPanel.current.toJSON().slice(-1)[0],
    hist: sharedHist.current.toJSON().slice(-1)[0],
    cols: sharedCols.current.toJSON().slice(-1)[0],
  });

  useEffect(() => {
    console.log('🌱 Initializing Yjs...');
    provider.current = new WebsocketProvider('ws://localhost:1234', roomName, doc.current);
    awareness.current = provider.current.awareness;

    provider.current.on('status', (e) => console.log(`WebSocket status: ${e.status}`));

    provider.current.on('synced', (isSynced) => {
      console.log('🛰 synced:', isSynced);
      console.log('📦 sharedArray:', sharedArray.current.toJSON());

      if (onSynced) onSynced(isSynced);

      if (isSynced && onSharedHistoryUpdateRef.current) {
        console.log('📤 calling onSharedHistoryUpdate from synced event');
        onSharedHistoryUpdateRef.current(getLatestState());
      }
    });

    sharedHist.current.observe((event) => {
      const fromYjs = sharedArray.current.toJSON();
      console.log('🧨 observe triggered — sharedArray from Yjs:', fromYjs);
      if (!event.transaction.local && onSharedHistoryUpdateRef.current) {
        console.log('📡 received remote sharedHist update');
        onSharedHistoryUpdateRef.current(getLatestState());
      }
    });

    return () => {
      provider.current.disconnect();
    };
  }, []);

  return {
    doc,
    provider,
    awareness,
    sharedArray,
    sharedStoryPanel,
    sharedHist,
    sharedCols,
  };
}
