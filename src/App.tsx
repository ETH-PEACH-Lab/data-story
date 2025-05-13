import React, { useState, useRef, useEffect, useCallback, createContext } from "react";
import "./styles/App.css";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import TableWithMenu from "./TableWithMenu/TableWithMenu";
import SidebarWithStoryMenu from "./SidebarWithMenu/SidebarWithStoryMenu";
import HistorySidebar from "./HistorySidebar";
import ErrorBoundary from "./ErrorBoundary";
import ConfirmationWindow from "./ConfirmationWindow";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import {
  handleDataLoaded,
  fetchData,
  initializeColumns,
} from "./utils/dataHandlers";
import { handleSort, handleFilter } from "./utils/filterSortHandlers";
import {
  toggleHistory,
  logAction,
  handleHistoryDelete,
  saveDataToHistory,
  areActionStacksEqual,
  switchHistoryEntry,
} from "./utils/historyHandlers";
import { handleStyleChange } from "./utils/styleHandlers";
import {
  getHistoryLocalStorage,
  setHistoryLocalStorage,
  setCurrentDataIdLocalStorage,
  getCurrentDataIdLocalStorage,
  getIdListLocalStorage,
  setIdListLocalStorage,
  clearAllLocalStorage,
} from "./utils/storageHandlers";
import { handleUndo, handleRedo } from "./utils/undoRedoHandlers";

registerAllModules();

const passkey = '123456';

const getRandomColor = () => {
  const letters = '0123456789A'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 11)]
  }
  return color
}

const Authentication = ({ onAuthenticated }) => {
  const [name, setName] = useState('');
  const [enteredPasskey, setEnteredPasskey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (enteredPasskey === passkey) {
      // Pass the name to the parent component if the passkey is correct
      onAuthenticated(name);
    } else {
      setErrorMessage('Incorrect passkey. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Please enter your name and the passkey</h2>
      <div>
        <label>Name: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Passkey: </label>
        <input
          type="password"
          value={enteredPasskey}
          onChange={(e) => setEnteredPasskey(e.target.value)}
        />
      </div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button onClick={handleLogin}>Submit</button>
    </div>
  );
};

export const SharedContext = createContext(null);

const UserCircles = ({ awareness }) => {

  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    const handleAwarenessUpdate = () => {
      const states = awareness.current.getStates();
      const updatedCollaborators = Array.from(states.entries()).map(([clientID, state]) => {
        const name = state.name; // Ensure a default name if not provided
        const color = state.cursor.color; // Get the cursor color
        return { name, color };
      });
      setCollaborators(updatedCollaborators);
    };

    awareness.current?.on('change', handleAwarenessUpdate);

    // Clean up listener when the component unmounts
    return () => {
      awareness.current.off('change', handleAwarenessUpdate);
    };
  }, [awareness.current]);

  return (
    <div className="collaborators-container">
      {collaborators.map((collaborator, index) => (
        <div key={index} className="user-circle" style={{ backgroundColor: collaborator.color, color: 'white' }}>
          {collaborator.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [currentDataId, setCurrentDataId] = useState(0);
  const [actions, setActions] = useState([]);
  const [clickedIndex, setClickedIndex] = useState(-1);
  const [replacementValue, setReplacementValue] = useState("");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [textStyles, setTextStyles] = useState({});
  const [filteredColumns, setFilteredColumns] = useState([]);
  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const tableContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);
  const [initialActionStack, setInitialActionStack] = useState([]);
  const [chartNames, setChartNames] = useState(["Table"]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [idList, setIdList] = useState(getIdListLocalStorage());
  const [pages, setPages] = useState([
    { id: 0, content: "table", title: "Table" },
  ]);
  const [footerNames, setFooterNames] = useState(["Table"]);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyComponents, setStoryComponents] = useState([]);

  const [isUndoDisabled, setUndoDisabled] = useState(true);
  const [isRedoDisabled, setRedoDisabled] = useState(true);

  const updateUndoRedoState = useCallback(() => {
    if (hotRef.current) {
      const undoRedo = hotRef.current.hotInstance.undoRedo;
      setUndoDisabled(!undoRedo.isUndoAvailable());
      setRedoDisabled(!undoRedo.isRedoAvailable());
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userCursorColor, setUserCursorColor] = useState(null);

  const handleAuthentication = (name) => {
    setUserName(name);
    const color = getRandomColor();
    setUserCursorColor(color);
    setIsAuthenticated(true);
  };

  const doc = useRef()
  const sharedArray = useRef()
  const sharedStoryPanel = useRef()
  const sharedHist = useRef()
  const sharedCols = useRef()
  const awareness = useRef(null)
  const cursors = useRef({})
  const provider = useRef(null);

  const [startEdit, setStartEdit] = useState(false)

  useEffect(() => {
    // Initialize Yjs document and WebSocket provider only once
    doc.current = new Y.Doc()
    sharedArray.current = doc.current.getArray('tableData3')
    sharedStoryPanel.current = doc.current.getArray('storyPanelData')
    sharedHist.current = doc.current.getArray('history')
    sharedCols.current = doc.current.getArray('columnConfigs')
    console.log("DIES IST EIN TEST")
    provider.current = new WebsocketProvider(
      'ws://10.5.34.218:3000',
      'data-story',
      doc.current
    )

    awareness.current = provider.current.awareness
    awareness.current.setLocalStateField('cursor', {
      x: 0,  // Initial x position (pixels)
      y: 0,  // Initial y position (pixels)
      color: userCursorColor,
    })


    awareness.current.setLocalStateField('name', userName);

    provider.current.on('status', (event) => {
      console.log(`WebSocket status: ${event.status}`) // logs "connected" or "disconnected"
    })

    provider.current.on('synced', (isSynced) => {
      console.log(`WebSocket synced: ${isSynced}`) // logs true or false
    })

    sharedHist.current.observe((event) => {
      const { transaction } = event
      const updatedStory = sharedStoryPanel.current.toJSON().slice(-1)[0]
      const updatedHist = sharedHist.current.toJSON().slice(-1)[0]
      const updatedTable = sharedArray.current.toJSON().slice(-1)[0]
      const updatedCols = sharedCols.current.toJSON().slice(-1)[0]

      // Ensure that the change was not made locally before syncing
      if (!transaction.local) {
        setData(updatedTable)
        setUploadHistory(updatedHist)
        setStoryComponents(updatedStory || [])
        if (updatedCols) setColumnConfigs(updatedCols)
      }
    })

    awareness.current.on('change', (changes) => {
      const states = awareness.current.getStates()
      // Save the cursor positions for each connected client
      cursors.current = states
      // Now you can update the UI to render other users' cursors
      renderCursors(states)
    })

    return () => {
      provider.current.disconnect()
    }

  }, []) // Empty dependency array ensures it runs only once on mount

  useEffect(() => {
    if (!data || data.length === 0) {
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

  const handleMouseMove = (event) => {
    const x = event.clientX // Cursor X position in pixels
    const y = event.clientY // Cursor Y position in pixels

    const currentLocalState = awareness.current.getLocalState();
    const currentCursorState = currentLocalState.cursor;
    // Update local state with the current cursor position
    awareness.current.setLocalStateField('cursor', {
      // Preserve previous state including color
      x: x,
      y: y,
      color: currentCursorState.color,
    })
  }

  useEffect(() => {
    if (userCursorColor) {
      // Handle the logic that needs to happen when userCursorColor is available
      console.log('Cursor color updated:', userCursorColor);
      const currentLocalState = awareness.current.getLocalState();
      const currentCursorState = currentLocalState.cursor;

      awareness.current.setLocalStateField('cursor', {
        x: currentCursorState.x, // Replace with the actual x position
        y: currentCursorState.y, // Replace with the actual y position
        color: userCursorColor, // Set the new cursor color
      });

      awareness.current.setLocalStateField('name', userName);

    }
  }, [userCursorColor]);


  useEffect(() => {
    // Add the event listener when the component mounts
    window.addEventListener('mousemove', handleMouseMove);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const renderCursors = (states) => {
    const cursorLayer = document.getElementById('cursor-layer');

    // Clear the current cursors in the layer
    cursorLayer.innerHTML = '';

    // Loop through the states to render each client's cursor
    states.forEach((state, clientId) => {
      const { cursor } = state;

      // Check if cursor data exists for the client
      if (cursor) {
        const cursorElement = document.createElement('div');
        cursorElement.className = 'cursor';
        cursorElement.style.position = 'absolute';
        cursorElement.style.left = `${cursor.x}px`;
        cursorElement.style.top = `${cursor.y}px`;
        cursorElement.style.width = '15px'; // Cursor size
        cursorElement.style.height = '15px';
        cursorElement.style.borderRadius = '50%';
        cursorElement.style.backgroundColor = cursor.color; // Use the user's unique color
        cursorElement.style.zIndex = '1000'; // Ensure it's on top of other elements

        // Optionally add a label or other client-specific info
        //  cursorElement.innerHTML = `<span style="color: black; font-size: 15px; position: absolute; left: 15px; top: 0;">User ${clientId}</span>`;

        // Append the cursor to the cursor layer
        cursorLayer.appendChild(cursorElement);
      }
    });
  }

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

  useEffect(() => {
    if (hotRef.current) {
      const hotInstance = hotRef.current.hotInstance;
      updateUndoRedoState();

      // Listen to Handsontable's hooks to update button states
      hotInstance.addHook("afterUndoStackChange", updateUndoRedoState);
      hotInstance.addHook("afterRedoStackChange", updateUndoRedoState);
    }
  }, [hotRef.current, updateUndoRedoState]);

  const handleSaveCurrentVersion = useCallback((historyMessage = "Undefined Change") => {
    if (hotRef.current) {
      saveDataToHistory(
        data,
        originalFileName,
        currentDataId,
        setUploadHistory,
        setCurrentDataId,
        idList,
        setIdList,
        updateHist,
        actions,
        originalFileName,
        textStyles,
        initialActionStackLength,
        hotRef,
        chartConfigs,
        footerNames,
        storyComponents,
        columnConfigs,
        historyMessage,
        userName,
      );
      setInitialActionStack([
        ...hotRef.current.hotInstance.undoRedo.doneActions,
      ]);
      setInitialActionStackLength(
        hotRef.current.hotInstance.undoRedo.doneActions.length
      );
    } else {
      console.log("hotRef.current is null");
    }

    setCurrentDataIdLocalStorage(currentDataId);
  }, [
    actions,
    chartConfigs,
    columnConfigs,
    currentDataId,
    data,
    footerNames,
    idList,
    initialActionStackLength,
    originalFileName,
    storyComponents,
    textStyles,
    sharedHist,
    userName,
  ]);

  const handleHistoryClick = useCallback(
    (historyEntry, index) => {
      const undoRedo = hotRef.current?.hotInstance?.undoRedo;

      const performSwitch = () => {
        if (currentPage > 0 && !historyEntry.charts?.[currentPage - 1]) {
          setCurrentPage(0);
        }

        switchHistoryEntry(
          historyEntry,
          index,
          setData,
          setTextStyles,
          initializeColumns,
          setColumnConfigs,
          setFilteredColumns,
          setClickedIndex,
          setCurrentDataId,
          setActions,
          setOriginalFileName,
          hotRef,
          setInitialActionStack,
          setInitialActionStackLength,
          setChartConfigs,
          setPages,
          setFooterNames,
          setCurrentPage,
          setChartNames,
          currentPage,
          setStoryComponents
        );
        setCurrentDataIdLocalStorage(historyEntry.id);
      };

      if (
        undoRedo &&
        !areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)
      ) {
        setConfirmationMessage(
          "You have unsaved changes. Do you want to save them?"
        );
        setShowConfirmation(true);
        setOnConfirmAction(() => () => {
          handleSaveCurrentVersion("Unsaved changes are saved");
          performSwitch();
        });
        setOnCancelAction(() => performSwitch);
      } else {
        performSwitch();
      }
    },
    [
      currentPage,
      handleSaveCurrentVersion,
      hotRef,
      initialActionStack,
      setConfirmationMessage,
      setData,
      setShowConfirmation,
    ]
  );

  const handleConfirm = useCallback(async () => {
    if (onConfirmAction) {
      await onConfirmAction(); // Handle async confirm actions
    }
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onConfirmAction]);

  const handleCancel = useCallback(() => {
    if (onCancelAction) {
      onCancelAction();
    }
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onCancelAction]);

  const handleDeleteAllHistory = useCallback(() => {
    setConfirmationMessage("Are you sure you want to delete all history?");
    setOnConfirmAction(() => () => {
      setUploadHistory([]);
      setIdList([]);
      setCurrentDataId(0);
      clearAllLocalStorage();
      updateHist([]);
    });
    setOnCancelAction(() => () => {
      setShowConfirmation(false);
      setOnConfirmAction(null);
      setOnCancelAction(null);
    });
    setShowConfirmation(true);
  }, []);

  useEffect(() => {
    const savedHistory = getHistoryLocalStorage();
    const savedCurrentDataId = getCurrentDataIdLocalStorage();
    const savedIdList = getIdListLocalStorage();
    setIdList(savedIdList);
    console.log("Initial loaded history:", savedHistory);
    console.log("Initial loaded currentDataId:", savedCurrentDataId);

    if (savedHistory.length > 0) {
      setUploadHistory(savedHistory);
      if (savedCurrentDataId !== null && savedCurrentDataId !== undefined) {
        setCurrentDataId(savedCurrentDataId);
        const historyEntry = savedHistory.find(
          (entry) => entry.id === savedCurrentDataId
        );
        if (historyEntry) {
          switchHistoryEntry(
            historyEntry,
            savedHistory.indexOf(historyEntry),
            setData,
            setTextStyles,
            initializeColumns,
            setColumnConfigs,
            setFilteredColumns,
            setClickedIndex,
            setCurrentDataId,
            setActions,
            setOriginalFileName,
            hotRef,
            setInitialActionStack,
            setInitialActionStackLength,
            setChartConfigs,
            setPages,
            setFooterNames,
            setCurrentPage,
            setChartNames,
            currentPage,
            setStoryComponents
          );
        }
      } else {
        setCurrentDataId(savedHistory[savedHistory.length - 1].id);
      }
    } else {
      fetchData(
        setData,
        setColumnConfigs,
        setOriginalFileName,
        setCurrentDataId,
        saveDataToHistory,
        idList,
        setIdList,
        updateHist,
        setUploadHistory,
        setActions,
        originalFileName,
        setTextStyles,
        setFilteredColumns,
        hotRef,
        setInitialActionStack,
        setInitialActionStackLength,
        []
      );

      // The study instructions should appear here
      setStoryComponents([
        {
          type: "text",
          text: `<h1 style="color:darkgreen; text-decoration:underline; font-weight:bold;">Data-Story</h1>`,
          fontSize: "32px",
        },
        {
          type: "text",
          text: `<p>Participant ID:</p>`,
          fontSize: "16px",
        },
        {
          type: "text",
          text: `<p>Please document your thought process underneath</p>`,
          fontSize: "16px",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (hotRef.current) {
      setInitialActionStack([
        ...hotRef.current.hotInstance.undoRedo.doneActions,
      ]);
      setInitialActionStackLength(
        hotRef.current.hotInstance.undoRedo.doneActions.length
      );
      console.log("Handsontable instance:", hotRef.current.hotInstance);
    }
  }, [hotRef.current]);

  useEffect(() => {
    setIdListLocalStorage(idList);
  }, [idList]);

  const handleUndoAction = useCallback(() => {
    handleUndo(hotRef);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleRedoAction = useCallback(() => {
    handleRedo(hotRef);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

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

  return (
    <SharedContext.Provider value={{ updateCols, updateStory, updateHist, updateTable, sharedHist, sharedArray }}>
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
          <div className="top-banner">
            <h1>Data-Story</h1>
            <div className="undo-redo-container">
              <button
                className={`btn btn-primary ${isUndoDisabled ? "disabled" : ""}`}
                onClick={handleUndoAction}
                disabled={isUndoDisabled}
              >
                <i className="bi bi-arrow-counterclockwise"></i> {"Undo"}
              </button>
              <button
                className={`btn btn-primary ${isRedoDisabled ? "disabled" : ""}`}
                onClick={handleRedoAction}
                disabled={isRedoDisabled}
              >
                <i className="bi bi-arrow-clockwise"></i> {"Redo"}
              </button>
            </div>
            <UserCircles awareness={awareness} />
            <div className="save-button-container">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (idList.length === 0) {
                    setIdList([1]);
                  }
                  handleSaveCurrentVersion("History update button is triggered");
                }}
              >
                <i className="bi bi-save"></i> {"Save Current Version"}
              </button>
            </div>
          </div>
          <div className="content-area">
            <TableWithMenu
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
            />
            <SidebarWithStoryMenu
              data={data}
              columnConfigs={columnConfigs}
              selectedColumnIndex={selectedColumnIndex}
              selectedColumnName={columnConfigs[selectedColumnIndex]?.title}
              handleFilter={handleFilter}
              hotRef={hotRef}
              filteredColumns={filteredColumns}
              setFilteredColumns={setFilteredColumns}
              selectedRange={selectedRange}
              tableContainerRef={tableContainerRef}
              setShowConfirmation={setShowConfirmation}
              setConfirmationMessage={setConfirmationMessage}
              setOnConfirmAction={setOnConfirmAction}
              setOnCancelAction={setOnCancelAction}
              chartNames={chartNames}
              chartConfigs={chartConfigs}
              components={storyComponents}
              setComponents={setStoryComponents}
              handleSaveCurrentVersion={handleSaveCurrentVersion}
            />
          </div>
          <HistorySidebar
            isHistoryVisible={isHistoryVisible}
            uploadHistory={uploadHistory}
            setUploadHistory={setUploadHistory}
            clickedIndex={clickedIndex}
            setColumnConfigs={setColumnConfigs}
            initializeColumns={initializeColumns}
            onHistoryItemClick={handleHistoryClick}
            onHistoryItemDelete={(index) =>
              handleHistoryDelete(
                index,
                uploadHistory,
                currentDataId,
                setData,
                initializeColumns,
                setCurrentDataId,
                setActions,
                setOriginalFileName,
                setUploadHistory,
                setShowConfirmation,
                setConfirmationMessage,
                setOnConfirmAction,
                setColumnConfigs,
                setFilteredColumns,
                idList,
                setIdList,
                updateHist,
              )
            }
            toggleHistory={() => toggleHistory(setHistoryVisible)}
            currentDataId={currentDataId}
            idList={idList}
            setIdList={setIdList}
            handleDeleteAllHistory={handleDeleteAllHistory}
            awareness={awareness}
          />
          {showConfirmation && (
            <ConfirmationWindow
              message={confirmationMessage}
              onConfirm={handleConfirm}
              onCancel={onCancelAction ? handleCancel : undefined}
            />
          )}
        </div>
        <div id="cursor-layer" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      </ErrorBoundary>
    </SharedContext.Provider>
  );
}

export default App;
