import React, { useState, useRef, useEffect, useCallback, createContext } from "react";
import "./styles/App.css";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import TableWithMenu from "./TableWithMenu/TableWithMenu";
// import SidebarWithStoryMenu from "./SidebarWithMenu/SidebarWithStoryMenu";
import HistorySidebar from "./components/HistorySidebar/HistorySidebar";
import ErrorBoundary from "./ErrorBoundary";
import ConfirmationWindow from "./ConfirmationWindow";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Authentication } from "./components/Authentication/AuthComponent";
// import { Authentication } from "./components/AuthComponent";

import CursorLayer from './components/CursorLayer';
import TopBanner from "./components/TopBanner/TopBanner";

import { useYjsSetup } from './hooks/useYjsSetup';
import { useAwareness } from './hooks/useAwareness';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useHistoryManager } from './hooks/useHistoryManager';

import {
  handleDataLoaded,
  initializeColumns,
} from "./utils/dataHandlers";


// import { handleSort, handleFilter } from "./utils/filterSortHandlers";

import {
  toggleHistory,
  saveDataToHistory,
  getCellDiff,
} from "./utils/historyHandlers";
import { handleStyleChange } from "./utils/styleHandlers";

registerAllModules();


const getRandomColor = () => {
  const letters = '0123456789A'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 11)]
  }
  return color
}

export const SharedContext = createContext(null);


function App() {
  const [data, setData] = useState([]);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [actions, setActions] = useState([]);
  // const [clickedIndex, setClickedIndex] = useState(-1);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [textStyles, setTextStyles] = useState({});
  const [filteredColumns, setFilteredColumns] = useState([]);
  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  // const [selectedRange, setSelectedRange] = useState(null);
  const tableContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  // const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);
  const [initialActionStack, setInitialActionStack] = useState([]);
  const [chartNames, setChartNames] = useState(["Table"]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [pages, setPages] = useState([
    { id: 0, content: "table", title: "Table" },
  ]);
  const [footerNames, setFooterNames] = useState(["Table"]);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyComponents, setStoryComponents] = useState([]);

  const undoRedo = useUndoRedo(hotRef);


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userCursorColor, setUserCursorColor] = useState(null);


  const handleAuthentication = (name) => {
    console.log('handle auth')
    setUserName(name);
    const color = getRandomColor();
    setUserCursorColor(color);
    setIsAuthenticated(true);
  };

  const {
    awareness,
    sharedArray,
    sharedStoryPanel,
    sharedHist,
    sharedCols,
  } = useYjsSetup({
    roomName: 'data-story',
    onSynced: (synced) => console.log('Synced:', synced),
    onSharedHistoryUpdate: ({ table, story, hist, cols }) => {
      setData(table);
      setUploadHistory(hist);
      setStoryComponents(story || []);
      if (cols) setColumnConfigs(cols);
    },
  });

  const awarenessStates = useAwareness(awareness);

  const [startEdit, setStartEdit] = useState(false)
  const [cellDiff, setCellDiff] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (data === null) {
      console.log('Data is not initialized, skipping synchronization.')
      return // Exit if data is not initialized
    }

    // Synchronize only once at the start
    if (!startEdit) {
      if (sharedArray.current.length === 0) {
        // Initialize shared array if empty
        console.log('Shared array is empty, pushing local data to Yjs')
        updateTable(data)
      } else {
        // Sync local data with Yjs data
        console.log('Setting data from shared array')
        setData(sharedArray.current.toJSON().slice(-1)[0])
      }
    }
  }, [data]) // Depend only on `data`


  useEffect(() => {
    if (!awareness?.current || !userCursorColor) return;

    const localState = awareness.current.getLocalState() || {};
    const currentCursor = localState.cursor || { x: 0, y: 0 };

    awareness.current.setLocalStateField('cursor', {
      x: currentCursor.x,
      y: currentCursor.y,
      color: userCursorColor,
    });

    awareness.current.setLocalStateField('name', userName);
  }, [userCursorColor, userName, awareness]);


  const handleExport = useCallback(
    (exportType) => {
      if (exportType === "table") {
        if (hotRef.current) {
          const hotInstance = hotRef.current.hotInstance;

          const headers = hotInstance.getColHeader();
          const tableData = hotInstance.getData();
          const rowHeaders = Array.from({ length: tableData.length }, (_, i) =>
            (i + 1).toString()
          );

          const tableDataWithRowHeaders = tableData.map((row, index) => [
            rowHeaders[index],
            ...row,
          ]);

          const fullData = [["", ...headers], ...tableDataWithRowHeaders];
          const csv = Papa.unparse(fullData);

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const fileName = `${originalFileName.replace(
            /\.[^/.]+$/,
            ""
          )}_Table.csv`;
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      } else if (exportType === "story") {
        const storyContainer = document.querySelector(".story-container");

        if (!storyContainer) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 0;

        const storyComponents = Array.from(storyContainer.children);
        const componentsToExport = storyComponents.slice(0, -1);

        componentsToExport.forEach((component, index) => {
          html2canvas(component, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (yPosition + imgHeight > pageHeight) {
              pdf.addPage();
              yPosition = 0;
            }

            pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight;

            if (index === componentsToExport.length - 1) {
              const fileName = `DataStory_${originalFileName.replace(
                /\.[^/.]+$/,
                ""
              )}_Story.pdf`;
              pdf.save(fileName);
            }
          });
        });
      }
    },
    [originalFileName, hotRef]
  );

  const updateStory = (components) => {
    sharedStoryPanel.current.push([components])
  }

  const updateHist = (history) => {
    sharedHist.current.push([history])
  }

  const updateCols = (columns) => {
    sharedCols.current.push([columns])
  }

  const updateTable = (data) => {
    sharedArray.current.push([data])
  }

  const history = useHistoryManager({
    hotRef,
    initializeColumns,
    updateHist,
    userName,
    originalFileName,
    textStyles,
    chartConfigs,
    footerNames,
    storyComponents,
    columnConfigs,
    currentPage,

    // ✅ These are needed by switchHistoryEntry
    setData,
    setTextStyles,
    setColumnConfigs,
    setFilteredColumns,
    setActions,
    setOriginalFileName,
    setInitialActionStack,
    setInitialActionStackLength,
    setChartConfigs,
    setPages,
    setFooterNames,
    setCurrentPage,
    setChartNames,
    setStoryComponents,
  });

  return (
    <SharedContext.Provider value={{
      updateCols, updateStory, updateHist, updateTable, sharedHist, sharedArray, cellDiff, undoRedo, awareness, historyState: history.historyState,
      historyActions: history.historyActions, confirmationState: history.confirmationState
    }}>
      <ErrorBoundary>
        <div>
          {isAuthenticated ? (
            <div>
              {/* Collaborative Yjs Table goes here */}
            </div>
          ) : (
            <>
              {/* Dark overlay on top of the entire page */}
              <div className="auth-overlay"></div>
              {/* The actual authentication dialog */}
              <div className="auth-container">
                <Authentication onAuthenticated={handleAuthentication} />
              </div>
            </>
          )}
        </div>

        {/* The rest of the page content */}
        <div className={`container-fluid ${!isAuthenticated ? 'blurred' : ''}`}>
          <TopBanner />
          <div className="content-area">
            {/* <TableWithMenu
              userCursorColor={userCursorColor}
              setUserCursorColor={setUserCursorColor}
              startEdit={startEdit}
              setStartEdit={setStartEdit}
              data={data}
              setData={setData}
              columnConfigs={columnConfigs}
              setColumnConfigs={setColumnConfigs}
              selectedColumnIndex={selectedColumnIndex}
              setSelectedColumnIndex={setSelectedColumnIndex}
              textStyles={textStyles}
              setTextStyles={setTextStyles}
              filteredColumns={filteredColumns}
              setFilteredColumns={setFilteredColumns}
              hotRef={hotRef}
              selectedCellsRef={selectedCellsRef}
              tableContainerRef={tableContainerRef}
              fileInputRef={fileInputRef}
              saveDataToHistory={saveDataToHistory}
              handleDataLoaded={handleDataLoaded}
              originalFileName={originalFileName}
              setOriginalFileName={setOriginalFileName}
              currentDataId={currentDataId}
              setCurrentDataId={setCurrentDataId}
              setUploadHistory={setUploadHistory}
              actions={actions}
              setActions={setActions}
              setInitialActionStack={setInitialActionStack}
              setInitialActionStackLength={setInitialActionStackLength}
              showConfirmation={showConfirmation}
              setShowConfirmation={setShowConfirmation}
              setConfirmationMessage={setConfirmationMessage}
              setOnConfirmAction={setOnConfirmAction}
              setOnCancelAction={setOnCancelAction}
              initialActionStack={initialActionStack}
              initialActionStackLength={initialActionStackLength}
              handleStyleChange={handleStyleChange}
              toggleHistory={() => toggleHistory(setHistoryVisible)}
              setSelectedRange={setSelectedRange}
              chartNames={chartNames}
              setChartNames={setChartNames}
              chartConfigs={chartConfigs}
              setChartConfigs={setChartConfigs}
              idList={idList}
              setIdList={setIdList}
              pages={pages}
              setPages={setPages}
              footerNames={footerNames}
              setFooterNames={setFooterNames}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              handleSaveCurrentVersion={handleSaveCurrentVersion}
              handleExport={handleExport}
            /> */}
          </div>
          <HistorySidebar
            isHistoryVisible={isHistoryVisible}
            toggleHistory={() => toggleHistory(setHistoryVisible)}
            selectEntry={(entry) => setCellDiff(getCellDiff(entry))}
          />
          {history.confirmationState.showConfirmation && (
            <ConfirmationWindow
              message={history.confirmationState.confirmationMessage}
              onConfirm={history.confirmationState.handleConfirm}
              onCancel={onCancelAction ? history.confirmationState.handleCancel : undefined}
            />
          )}
        </div>
        <CursorLayer
          awareness={awareness.current}
          awarenessStates={awarenessStates}
        />
      </ErrorBoundary>
    </SharedContext.Provider>
  );
}

export default App;
