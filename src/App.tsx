import React, { useState, useRef, useEffect, useCallback, createContext } from "react";
import "./App.css";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";

import HistorySidebar from "./components/HistorySidebar/HistorySidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import ConfirmationWindow from "./components/ConfirmWindow/ConfirmationWindow";
import { Authentication } from "./components/Authentication/AuthComponent";
import CursorLayer from './components/CursorLayer';
import TopBanner from "./components/TopBanner/TopBanner";
import TableComponent from './components/TableComponent/TableComponent';

import { useYjsSetup } from './hooks/useYjsSetup';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useHistoryManager } from './hooks/useHistoryManager';

import { initializeColumns } from "./utils/dataHandlers";
import { getCellDiff } from "./utils/historyHandlers";

registerAllModules();

const getRandomColor = () => {
  const letters = '0123456789A';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 11)];
  }
  return color;
};

export const SharedContext = createContext(null);

function App() {
  const [data, setData] = useState([]);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => { });
  const [actions, setActions] = useState([]);
  const [originalFileName, setOriginalFileName] = useState("");
  const [cellDiff, setCellDiff] = useState(new Set());
  const [cellFormat, setCellFormat] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userCursorColor, setUserCursorColor] = useState(null);

  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  const tableContainerRef = useRef(null);

  const undoRedo = useUndoRedo(hotRef);

  const yjs = useYjsSetup({
    roomName: 'data-story',
    onSynced: (synced) => {
      console.log('✅ Synced:', synced);
    },
    onSharedHistoryUpdate: ({ table, story, hist, cols }) => {

      if (Array.isArray(table)) {
        setData(table);
      }

      if (cols) {
        setColumnConfigs(cols);
      } else if (table && typeof table === 'object' && !Array.isArray(table)) {
        // Defensive: avoid accidentally setting a row as data
        setData([table]);
      } else if (Array.isArray(table) && table.length > 0) {
        const keys = Object.keys(table[0]);
        const inferred = keys.map(key => ({
          data: key,
          title: key,
          width: 100,
        }));
        setColumnConfigs(inferred);
      }

      if (hist) {
        history.historyState.setUploadHistory(hist);
      }
    }
  });


  const updateHist = useCallback((history) => {
    yjs.sharedHist.current.push([history]);
  }, [yjs]);

  const updateStory = useCallback((components) => {
    yjs.sharedStoryPanel.current.push([components]);
  }, [yjs]);

  const updateCols = useCallback((columns) => {
    yjs.sharedCols.current.push([columns]);
  }, [yjs]);

  const updateTable = useCallback((data) => {
    const shared = yjs.sharedArray.current;
    yjs.doc.current.transact(() => {
      shared.delete(0, shared.length);        // 清空
      data.forEach(row => shared.push([row])); // ✅ 每行包成 [row] 推入
    });
  }, [yjs]);

  const history = useHistoryManager({
    data,
    hotRef,
    initializeColumns,
    updateHist,
    userName,
    originalFileName,
    columnConfigs,
    sharedArray: yjs.sharedArray,
    setData,
    setColumnConfigs,
    setActions,
    setOriginalFileName,
    onRequireConfirmation: (message, confirmCallback) => {
      setConfirmationMessage(message);
      setOnConfirmAction(() => confirmCallback);
      setConfirmationVisible(true);
    },
  });

  useEffect(() => {
    if (!yjs) return;
    yjs.setOnSharedHistoryUpdate?.(({ table, hist, cols }) => {
      setData(table);
      history.historyState.setUploadHistory(hist);
      if (cols) setColumnConfigs(cols);
    });
  }, [yjs, history.historyState.setUploadHistory]);


  useEffect(() => {
    if (!yjs.awareness?.current || !userCursorColor) return;

    const localState = yjs.awareness.current.getLocalState() || {};
    const currentCursor = localState.cursor || { x: 0, y: 0 };

    yjs.awareness.current.setLocalStateField('cursor', {
      x: currentCursor.x,
      y: currentCursor.y,
      color: userCursorColor,
    });

    yjs.awareness.current.setLocalStateField('name', userName);
  }, [userCursorColor, userName, yjs.awareness]);


  const handleAuthentication = (name) => {
    setUserName(name);
    setUserCursorColor(getRandomColor());
    setIsAuthenticated(true);
  };

  return (
    <SharedContext.Provider value={{
      updateCols, updateStory, updateHist, updateTable,
      sharedHist: yjs.sharedHist, sharedArray: yjs.sharedArray,
      cellDiff, undoRedo, awareness: yjs.awareness,
      historyState: history.historyState,
      historyActions: history.historyActions,
      cellFormat, setCellFormat, selectedCellsRef,
    }}>
      <ErrorBoundary>
        <div>
          {isAuthenticated ? (
            <></>
          ) : (
            <>
              <div className="auth-overlay"></div>
              <div className="auth-container">
                <Authentication onAuthenticated={handleAuthentication} />
              </div>
            </>
          )}
        </div>

        <div className={`${!isAuthenticated ? 'blurred' : ''}`}>
          <TopBanner />
          <div className="main-content-row">
            <TableComponent
              data={data}
              setData={setData}
              columnConfigs={columnConfigs}
              setColumnConfigs={setColumnConfigs}
              setSelectedColumnIndex={() => { }}
              hotRef={hotRef}
              selectedCellsRef={selectedCellsRef}
              tableContainerRef={tableContainerRef}
            />
            <HistorySidebar
              selectEntry={(entry) => setCellDiff(getCellDiff(entry))}
            />
          </div>

          {confirmationVisible && (
            <ConfirmationWindow
              message={confirmationMessage}
              onConfirm={() => {
                onConfirmAction();
                setConfirmationVisible(false);
              }}
              onCancel={() => setConfirmationVisible(false)}
            />
          )}
        </div>

        <CursorLayer
          awareness={yjs.awareness.current}
        />
      </ErrorBoundary>
    </SharedContext.Provider>
  );
}

export default App;
