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

  useEffect(() => {
    provider.current = new WebsocketProvider('ws://10.5.34.218:3000', roomName, doc.current);
    awareness.current = provider.current.awareness;

    provider.current.on('status', (e) => console.log(`WebSocket status: ${e.status}`));
    provider.current.on('synced', onSynced);

    sharedHist.current.observe((event) => {
      if (!event.transaction.local && onSharedHistoryUpdate) {
        onSharedHistoryUpdate({
          table: sharedArray.current.toJSON().slice(-1)[0],
          story: sharedStoryPanel.current.toJSON().slice(-1)[0],
          hist: sharedHist.current.toJSON().slice(-1)[0],
          cols: sharedCols.current.toJSON().slice(-1)[0],
        });
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
