import { setHistoryLocalStorage, getHistoryLocalStorage, setCurrentDataIdLocalStorage, setIdListLocalStorage } from './storageHandlers';
import { BrushState } from "../App"

export const logAction = (setActions, actionDescription) => {
  setActions(prevActions => [...prevActions, actionDescription]);
};

export const handleHistoryDelete = (
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
  setIdList,
  updateHist,
) => {
  const historyEntryToDelete = uploadHistory[index];
  const isDeletingCurrentData = historyEntryToDelete.id === currentDataId;
  const parentId = historyEntryToDelete.parentId;
  const newHistory = uploadHistory.filter((_, i) => i !== index);

  const parentEntryExists = newHistory.some((entry) => entry.id === parentId);

  const addIdToFront = (id) => {
    if (typeof id === 'number' && !isNaN(id)) {
      // Add the deleted entry's ID back to the front of the list
      setIdList((prevList) => {
        const newList = [id, ...prevList];
        setIdListLocalStorage(newList); // Save the updated list to localStorage
        return newList;
      });
    }
  };

  if (!parentEntryExists) {
    setShowConfirmation(true);
    setConfirmationMessage('Parent version no longer exists. Do you want to delete this version?');
    setOnConfirmAction(() => () => {
      if (isDeletingCurrentData) {
        setData([]);
        // initializeColumns([], setColumnConfigs, setFilteredColumns);
        initializeColumns([], setColumnConfigs);
        setCurrentDataId(null);
        setActions([]);
        setOriginalFileName('');
      }
      setUploadHistory(newHistory);
      setHistoryLocalStorage(newHistory);
      setCurrentDataIdLocalStorage(null);
      addIdToFront(historyEntryToDelete.id);

      if (newHistory.length === 0) {
        const resetIdList = [1, 2, 3];  // Reset the idList
        setIdList(resetIdList);
        setIdListLocalStorage(resetIdList);
      }
    });
  } else {
    if (isDeletingCurrentData) {
      const parentEntry = newHistory.find((entry) => entry.id === parentId);
      setData(parentEntry.data);
      initializeColumns(parentEntry.data, setColumnConfigs, setFilteredColumns);
      setCurrentDataId(parentEntry.id);
      setActions(parentEntry.actions);
      setOriginalFileName(parentEntry.fileName);
    }
    setUploadHistory(newHistory);
    setHistoryLocalStorage(newHistory);
    setCurrentDataIdLocalStorage(currentDataId);
    addIdToFront(historyEntryToDelete.id);

    if (newHistory.length === 0) {
      const resetIdList = [1, 2, 3];  // Reset the idList when all history is deleted
      setIdList(resetIdList);
      setIdListLocalStorage(resetIdList);
    }
  }
  updateHist(newHistory)
};

export const saveDataToHistory = (
  newData,
  fileName,
  parentId,
  setUploadHistory,
  setCurrentDataId,
  idList,
  setIdList,
  updateHist,
  actions,
  originalFileName,
  initialActionStackLength,
  hotRef,
  columnConfigs, // Ensure columnConfigs is passed here
  cellFormat,
  historyMessage,
  author,
  cellChanges = {},
) => {
  const timestamp = new Date().toLocaleString();
  const fileNameToUse = fileName || originalFileName || "initial dataset";
  const dataCopy = JSON.parse(JSON.stringify(newData));

  const currentActionStack = hotRef.current?.hotInstance?.undoRedo?.doneActions || [];
  const newActions = currentActionStack.slice(initialActionStackLength);

  setUploadHistory((prevHistory) => {
    const updatedHistory = [
      ...prevHistory,
      {
        id: prevHistory.at(-1).id + 1,
        parentId: parentId,
        data: dataCopy,
        fileName: fileNameToUse,
        timestamp: timestamp,
        actions: newActions,
        columnConfigs: columnConfigs, // Save the updated columnConfigs (titles)
        cellFormat: cellFormat,
        historyMessage: historyMessage,
        author: author,
        cellChanges: cellChanges,
      },
    ];
    setHistoryLocalStorage(updatedHistory);
    updateHist(updatedHistory);
    return updatedHistory;
  });
};

export const areActionStacksEqual = (stack1, stack2, length) => {
  if (stack1.length !== stack2.length) return false;
  for (let i = 0; i < Math.min(length, stack1.length); i++) {
    if (JSON.stringify(stack1[i]) !== JSON.stringify(stack2[i])) {
      return false;
    }
  }
  return true;
};

export const switchHistoryEntry = (
  historyEntry,
  index,
  setData,
  initializeColumns,
  setColumnConfigs,
  setCellFormat,
  setCurrentDataId,
  setActions,
  setOriginalFileName,
  hotRef,
  setInitialActionStack,
  setInitialActionStackLength
) => {
  setData(JSON.parse(JSON.stringify(historyEntry.data)));
  setCellFormat(historyEntry.cellFormat || {});

  // Use saved columnConfigs from history if available
  const savedColumnConfigs = historyEntry.columnConfigs || null;

  // Initialize columns with saved columnConfigs (if available)
  initializeColumns(
    historyEntry.data,
    setColumnConfigs,
    savedColumnConfigs // Pass savedColumnConfigs
  );

  setActions(historyEntry.actions);
  setOriginalFileName(historyEntry.fileName);
  setInitialActionStack([...hotRef.current?.hotInstance?.undoRedo?.doneActions || []]);
  setInitialActionStackLength(hotRef.current?.hotInstance?.undoRedo?.doneActions?.length || 0);
};

const filterAuthors = (uploadHistory, authors) => {
  if (authors?.length === 0) return uploadHistory

  return uploadHistory.map(bundle => ({
    ...bundle,
    entries: bundle.entries.filter(entry => authors.includes(entry.author)),
  })).filter(bundle => bundle.entries.length > 0)
}

const filterTime = (uploadHistory, start, end) => {
  if (start === null || end === null) return uploadHistory

  return uploadHistory.map(bundle => ({
    ...bundle,
    entries: bundle.entries.filter(
      entry => new Date(entry.timestamp) >= start && new Date(entry.timestamp) <= end
    )
  })).filter(bundle => bundle.entries.length > 0)
}

const filterCells = (uploadHistory, cells) => {
  if (cells?.length === 0) return uploadHistory
  const cellSet = new Set(cells.map(cell => `${cell[0]},${cell[1]}`))

  return uploadHistory.map(bundle => ({
    ...bundle,
    entries: bundle.entries.filter(entry => {
      return entry.cellChanges?.some(change => cellSet.has(`${change[0]},${change[1]}`))
    }),
  })).filter(bundle => bundle.entries.length > 0)
}

// 当前行号 -> 结构变更前的行号
function resolveRowOrigin(currentRow, structureChanges) {
  let offset = 0
  for (const change of structureChanges) {
    if (change.type === "structure" && change.spec === "addrow") {
      if (change.row <= currentRow + offset) {
        offset -= 1 // one row was inserted before currentRow, so shift up
      }
    } else if (change.type === "structure" && change.spec === "deleterow") {
      if (change.row < currentRow + offset) {
        offset += 1 // one row was deleted before currentRow, so shift down
      }
    }
  }
  return currentRow + offset
}

function traceDeepEntries(entries, initialCells) {
  let targetCells = [...initialCells.map(([r, c]) => ({ row: r, col: c }))];
  const resultEntries = [];

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    let matched = false;
    console.log("Tracing entry:", entry.id);

    // 1. 看这个 entry 是否涉及当前追踪的 cell
    if (entry.cellChangesDeep) {
      for (const change of entry.cellChangesDeep) {
        for (const cell of targetCells) {
          if (change.row === cell.row && change.column === cell.col) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (matched) {
      resultEntries.push(entry);
    }

    // 2. 如果这个 entry 是结构性变更，则更新坐标追踪
    if (entry.cellChangesDeep) {
      for (const change of entry.cellChangesDeep) {
        if (change.type === "structure") {
          const { spec, row, column } = change;

          targetCells = targetCells.map(cell => {
            let newRow = cell.row;
            let newCol = cell.col;

            if (spec === "addrow" && row <= cell.row) {
              newRow += 1;
            }
            if (spec === "rmrow" && row < cell.row) {
              newRow -= 1;
            }
            if (spec === "addcol" && column <= cell.col) {
              newCol += 1;
            }
            if (spec === "rmcol" && column < cell.col) {
              newCol -= 1;
            }

            return { row: newRow, col: newCol };
          });
        }
      }
    }
    console.log("Current target cells:", targetCells);
    console.log(resultEntries)
  }

  return resultEntries;
}

function traceDeepEntriesWithExternalTarget(entries, initialTargetCells) {
  const matched = [];
  const traceMap = []; // <- NEW: stores { id, cells }

  let targetCells = [...initialTargetCells];

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const changes = entry.cellChangesDeep || [];

    const touchesTarget = changes.some(change =>
      targetCells.some(tc => change.row === tc.row && change.column === tc.col)
    );

    if (touchesTarget) {
      matched.unshift(entry);
      traceMap.unshift({ id: entry.id, cells: [...targetCells] }); // save snapshot of target cells
    }

    for (const change of changes) {
      if (change.type === "structure") {
        const { spec, row, column } = change;

        targetCells = targetCells.map(cell => {
          let newRow = cell.row;
          let newCol = cell.col;

          if (row === newRow && column === newCol) {
            if (spec === "addrow") newRow -= 1;
            if (spec === "rmrow") newRow += 1;
            if (spec === "addcol") newCol -= 1;
            if (spec === "rmcol") newCol += 1;
          }

          return { row: newRow, col: newCol };
        });
      }
    }
  }

  return { entries: matched, traceMap }; // return both
}



function updateTargetCellsWithStructure(entries, targetCells) {
  let updated = [...targetCells];

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (!entry.cellChangesDeep) continue;

    for (const change of entry.cellChangesDeep) {
      if (change.type !== "structure") continue;
      const { spec, row, column } = change;

      updated = updated.map(cell => {
        let newRow = cell.row;
        let newCol = cell.col;
          if (row == newRow && column == newCol) {
            if (spec === "addrow") newRow -= 1;
            if (spec === "rmrow") newRow += 1;
            if (spec === "addcol") newCol -= 1;
            if (spec === "rmcol") newCol += 1;
          }

        return { row: newRow, col: newCol };
      });
    }
  }

  return updated;
}


const filterDeepCells = (uploadHistory, cells) => {
  if (!cells || cells.length === 0) return uploadHistory;

  let targetCells = [...cells.map(([r, c]) => ({ row: r, col: c }))];
  const result = [];
  const globalTraceMap = []; // <- here

  for (let i = uploadHistory.length - 1; i >= 0; i--) {
    const bundle = uploadHistory[i];
    const { entries: tracedEntries, traceMap } = traceDeepEntriesWithExternalTarget(bundle.entries, targetCells);

    if (tracedEntries.length > 0) {
      result.unshift({
        ...bundle,
        entries: tracedEntries,
      });
      globalTraceMap.unshift(...traceMap); // accumulate
    }

    targetCells = updateTargetCellsWithStructure(bundle.entries, targetCells);
  }

  // OPTIONAL: store this globally
  window.deepTraceMap = globalTraceMap;
  return result;
};


const filterKeyword = (uploadHistory, keyword) => {
  if (!keyword || keyword.trim() === "") return uploadHistory

  return uploadHistory.map(bundle => ({
    ...bundle,
    entries: bundle.entries.filter(entry => entry.historyMessage.includes(keyword))
  })).filter(bundle => bundle.entries.length > 0)
}

export const filterHistory = (history, authors, start, end, cells, keyword, brushState) => {
  if (brushState !== BrushState.BRUSHED) return history
  return filterKeyword(filterCells(filterTime(filterAuthors(history, authors), start, end), cells), keyword)
}


export const filterDeepHistory = (history, authors, start, end, cells, keyword, brushState) => {
  console.log("filterDeepHistory")
  if (brushState !== BrushState.BRUSHED) return history
  return filterKeyword(filterDeepCells(filterTime(filterAuthors(history, authors), start, end), cells), keyword)
}

export const getAllAuthors = (uploadHistory) => {
  const authors = uploadHistory
    .map(entry => entry.author)
    .filter(author => author !== undefined)
  return [...new Set(authors)]
}

export const getAuthors = (bundle) => {
  const entries = bundle.entries
  const authors = entries.map(entry => entry.author).filter(author => author !== undefined)
  const uniqueAuthors = [...new Set(authors)]
  return uniqueAuthors.join(", ")
}

export const bundleHistoryEntries = (uploadHistory) => {

  const threshold = 10 * 60 * 1000

  return uploadHistory.reduce((bundledHistory, entry) => {
    const entryTimestamp = new Date(entry.timestamp).getTime()

    const lastBundle = bundledHistory[bundledHistory.length - 1]
    if (lastBundle && entryTimestamp - new Date(lastBundle.endTime).getTime() <= threshold) {
      return bundledHistory.map((bundle, index) =>
        index === bundledHistory.length - 1
          ? {
            ...bundle,
            entries: [...bundle.entries, entry],
            endTime: entry.timestamp,
            endDate: entry.date,
          }
          : bundle
      );
    }

    return [
      ...bundledHistory,
      {
        startTime: entry.timestamp,
        endTime: entry.timestamp,
        startDate: entry.date,
        endDate: entry.date,
        entries: [entry],
      },
    ]
  }, []);
}

const arrayToSet = (array, set) => {
  array.forEach((change) => set.add(change[0] + "," + change[1]))
  return set
}

export const getCellDiff = (entry) => {
  const cells = new Set()
  if (entry?.cellChanges.length > 0) arrayToSet(entry.cellChanges, cells)
  else if (entry?.actions[0]?.actionType === "change") arrayToSet(entry.actions[0].changes, cells)
  return cells
}

export const getCellDeepDiff = (entry) => {
  return entry?.cellChangesDeep ? entry.cellChangesDeep : null;
}

export const getDataset = (bundles) => {
  return bundles.map(bundle => {
    return {
      id: bundle.startTime,
      start: bundle.startTime,
      end: bundle.endTime,
    }
  })
}