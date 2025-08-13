import React, { useState, useEffect, useRef, useCallback, useContext } from "react";

import List from '@mui/material/List';
import { IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';


import { SharedContext, getColor, BrushState } from "../../App";
import {
  filterHistory,
  filterDeepHistory,
  bundleHistoryEntries,
  getAuthors,
  getAllAuthors,
  getDataset
} from "../../utils/historyHandlers";
import { getTime, getInterval } from "../../utils/formatHandlers"

import "./HistorySidebar.css";
import VBrush from "../VBrush"
import HistoryMenu from "./HistoryMenu"
import TimelineComponent from "./TimelineComponent";
import QueryComponent from "./QueryComponent";
import { CircleComponent } from "../../components/TopBanner/UserCircles";

const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

export interface HistoryEntry {
  id: number;
  author: string;
  timestamp: string;
  historyMessage: string;
  cellChanges: number[][]
}

export interface HistoryBundle {
  startTime: string;
  endTime: string;
  entries: HistoryEntry[];
}

interface HistorySidebarProps {
  selectEntry: (entry: HistoryEntry | null) => void
  brushState: BrushState
  setBrushState: (state: BrushState) => void
  setBrushedCells: (cells: number[][]) => void,
  setEntryId: (id: number) => void,
  entryId: number
}

const HistorySidebar = ({
  selectEntry,
  brushState,
  setBrushState,
  setBrushedCells,
  setEntryId,
  entryId
}: HistorySidebarProps) => {
  const [bundles, setBundles] = useState<HistoryBundle[]>([]);
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [intervalStart, setIntervalStart] = useState<Date | null>(null)
  const [intervalEnd, setIntervalEnd] = useState<Date | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<number>(-1)
  const [editingMessage, setEditingMessage] = useState<string>("")
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuId, setMenuId] = useState(-1)
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [diffMode, setDiffMode] = useState<"before" | "after">("after");
  const [filteredBundles, setFilteredBundles] = useState<HistoryBundle[]>([]);
  const [brushedWords, setBrushedWords] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const {
    historyState,
    historyActions,
    brushedCells,
    appState,
  } = useContext(SharedContext);

  const {
    uploadHistory,
    setUploadHistory,
  } = historyState;
  const {
    handleHistoryClick,
    syncHistory,
  } = historyActions;
  const listRef = useRef(null);

  const handleMerge = (entry: HistoryEntry) => {
    if (!entry) return

    const entryIndex = uploadHistory.findIndex((e) => e.id === entry.id)
    if (entryIndex <= 0) return

    setUploadHistory((prevHistory: HistoryEntry[]) => {
      const updatedHistory = [...prevHistory]
      const currentEntry = updatedHistory[entryIndex]
      const previousEntry = updatedHistory[entryIndex - 1]

      // Merge the current entry into the previous one
      const mergedEntry = {
        ...currentEntry,
        cellChanges: [...previousEntry.cellChanges, ...currentEntry.cellChanges],
      }

      // Replace the previous entry with the merged one and remove the current entry
      updatedHistory[entryIndex - 1] = mergedEntry
      updatedHistory.splice(entryIndex, 1)

      syncHistory(updatedHistory)
      selectEntry(mergedEntry)
      return updatedHistory
    })
  }

  const handleEdit = (entry: HistoryEntry) => {
    setMenuAnchor(null)
    setEditingEntryId(entry.id)
    setEditingMessage(entry.historyMessage)
  }

  const saveEditedMessage = (entryId: number) => {
    inputRef.current?.blur()
    if (entryId < 0) return

    setUploadHistory((prevHistory: HistoryEntry[]) => {
      const updatedHistory = prevHistory.map((entry) => {
        if (entry.id !== entryId) return entry
        return { ...entry, historyMessage: editingMessage }
      })
      syncHistory(updatedHistory)
      return updatedHistory
    })

    setEditingEntryId(-1)
    setEditingMessage("")
  }

  useOutsideClick(inputRef, () => {
    if (editingEntryId >= 0) saveEditedMessage(editingEntryId)
  })

  const toggleBundle = useCallback((index: number) => {
    const bundleState = [...isOpen]
    bundleState[index] = !bundleState[index]
    setIsOpen(bundleState)
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) return
    const bundles = bundleHistoryEntries(uploadHistory)
    setBundles(bundles)
    if (bundles.length > isOpen.length) {
      setIsOpen((prev) => [...prev, ...Array(bundles.length - prev.length).fill(false)])
    }
  }, [uploadHistory]);

  useEffect(() => {
    setFilteredBundles(bundles);
  }, [bundles]);

  useEffect(() => {
    if (editingEntryId >= 0 && inputRef.current) inputRef.current.focus()
  }, [editingEntryId])

  useEffect(() => {
    const result = filterDeepHistory(
      bundles,
      selectedCollaborators,
      intervalStart,
      intervalEnd,
      brushedCells,
      brushedWords,
      brushState
    )
    setFilteredBundles(result);
    if (brushState === BrushState.IDLE) viewCurrentVersion()
    else if (brushState === BrushState.BRUSHED) {
      if (result.length === 0) return
      handleHistoryItemClick(result.at(-1).entries.at(-1))
    }
  }, [brushState]);

  const viewCurrentVersion = () => {
    setEntryId(-1);
    setSelectedId(-1);
    selectEntry(null)
    handleHistoryClick(uploadHistory.at(-1), -1)
  }

  const handleDiffSwitch = (e: React.MouseEvent<HTMLButtonElement>, entry: HistoryEntry) => {
    //switch to the previous entry if available
    // find the previous entry from bundles
    e.stopPropagation();
    if (diffMode === "after") {
      const currentIndex = uploadHistory.findIndex((e) => e.id === entry.id)
      if (currentIndex > 0) {
        const previousEntry = uploadHistory[currentIndex - 1]
        handleHistoryClick(previousEntry, -1)
        setEntryId(previousEntry.id);
      }
    }
    else {
      setEntryId(entry.id);
      handleHistoryClick(entry, -1) // Switch to the current entry
    }
    setDiffMode((prev) => (prev === "before" ? "after" : "before"));
  }

  const handleHistoryItemClick = (entry: HistoryEntry) => {
    setEntryId(entry.id);
    setSelectedId(entry.id);
    setDiffMode("after");
    if (brushState === BrushState.BRUSHING) return
    if (entryId !== entry.id) {
      selectEntry(entry)
      handleHistoryClick(entry, -1)
    } else {
      viewCurrentVersion()
    }
  }

  const allCollaborators = getAllAuthors(uploadHistory).map((author: string) => ({
    name: author,
    color: getColor(author)
  }))

  const resetBrushing = () => {
    setSelectedCollaborators([])
    setBrushedCells([])
    setBrushedWords(new Set())
    setIsOpen(Array(bundles.length).fill(false))
  }

  const findCollaboratorColor = (author: string): string => {
    return allCollaborators.find((collab: { name: string; }) => collab.name === author)?.color || getColor(author);
  }

  // Helper to render authors blob with color dots for each author
  const getAuthorsBlob = (bundle: HistoryBundle, entry?: HistoryEntry) => {
    let authorsString = "";
    if (bundle) authorsString = getAuthors(bundle);
    if (entry) {
      authorsString = entry.author;
    }
    const authors = authorsString.split(/,\s*/);
    return (
      <span>
        {authors.map((author, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: findCollaboratorColor(author),
              marginRight: 4
            }}
          />
        ))}
        <span style={{ marginLeft: 4 }}>{authorsString}</span>
      </span>
    );
  };

  const handleBrushedWords = (word: string) => {
    setBrushedWords((prev) => {
      const newWords = new Set(prev)
      if (newWords.has(word)) newWords.delete(word)
      else newWords.add(word)
      return newWords
    })
  }

  return (
    <div className={"history-sidebar"}>
      <div className="button-container d-flex justify-content-between align-items-center p-2 pb-3">
        <strong>Editing History</strong>
        <VBrush
          brushState={brushState}
          setBrushState={setBrushState}
          resetBrushing={resetBrushing}
          viewCurrentVersion={viewCurrentVersion}
          openBundles={() => setIsOpen(Array(bundles.length).fill(true))}
          appState={appState}
        />
      </div>
      {brushState === BrushState.BRUSHING && <div>
        <div className="button-container d-flex justify-content-between align-items-center p-2 pb-3">
          <div>Contributors:</div>
          <CircleComponent
            collaborators={selectedCollaborators}
            allCollaborators={allCollaborators}
            setCollaborators={setSelectedCollaborators}
          />
        </div>
        <TimelineComponent
          items={getDataset(bundles)}
          start={intervalStart}
          end={intervalEnd}
          setStart={setIntervalStart}
          setEnd={setIntervalEnd}
        />
      </div>}
      {brushState === BrushState.BRUSHED && <>
        <QueryComponent
          brushedCells={brushedCells}
          selectedCollaborators={selectedCollaborators}
          intervalStart={intervalStart}
          intervalEnd={intervalEnd}
          brushedWords={brushedWords}
        />
        {filteredBundles.length === 0 &&
          <Alert severity="error" className="m-3">
            <AlertTitle>No edits found.</AlertTitle>
            Try again using another query.
          </Alert>
        }
      </>}
      <List>
        <ul className="list-group w-100" ref={listRef}>
          {filteredBundles.slice().reverse().map((bundle: HistoryBundle, index: number) => (
            <div key={index}>
              <ListItemButton className="history-entry-head" onClick={() => toggleBundle(index)}>
                <ListItemIcon>
                  {isOpen[index] ? <ExpandMore /> : <ChevronRight />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    getInterval(bundle.startTime, bundle.endTime)
                  }
                  secondary={<span style={{ display: 'inline-flex', alignItems: 'center' }}>{getAuthorsBlob(bundle)}</span>}
                />
              </ListItemButton>
              <Collapse in={isOpen[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {bundle.entries.slice().reverse().map((entry: HistoryEntry, index: number) => (
                    <ListItemButton
                      key={index}
                      sx={{ ml: 9, position: 'relative', display: 'flex', alignItems: 'center' }}
                      className={entry.id === selectedId ? "history-selected history-entry" : "history-entry"}
                      onClick={() => handleHistoryItemClick(entry)}
                      selected={entry.id === selectedId}
                      onMouseEnter={() => setMenuId(entry.id)}
                      onMouseLeave={() => setMenuId(-1)}
                    >
                      {entry.id === selectedId && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleDiffSwitch(e, entry)}
                          style={{ marginRight: 8, marginLeft: '-42px' }}
                        >
                          {diffMode === "before" ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                        </IconButton>
                      )}
                      <ListItemText
                        style={{ paddingRight: '30px' }}
                        secondary={
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {getAuthorsBlob(null, entry)}<span>{' - '}{getTime(entry.timestamp)}</span>
                          </span>
                        }
                        primary={
                          editingEntryId === entry.id ? (
                            <TextField
                              fullWidth
                              inputRef={inputRef}
                              size="small"
                              variant="standard"
                              value={editingMessage}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setEditingMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditedMessage(entry.id)
                              }}
                            />
                          ) : (
                            <Typography
                              component="div"
                              sx={{
                                display: "flex",
                                gap: "4px"
                              }}
                            >
                              {brushState === BrushState.BRUSHING ? (
                                entry.historyMessage.split(" ").map((word, index) =>
                                  <span
                                    key={index}
                                    onClick={() => handleBrushedWords(word) }
                                    className={"brushing" + (brushedWords.has(word) ? " brushed-word" : "")}
                                  >
                                    {word}
                                  </span>
                                )
                              ) : (
                                <span>{entry.historyMessage}</span>
                              )}
                            </Typography>
                          )
                        }
                      />
                      <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                        {(brushState === BrushState.IDLE && (entry.id === selectedId || entry.id === menuId)) && (
                          <HistoryMenu
                            entry={entry}
                            handleEdit={handleEdit}
                            handleMerge={handleMerge}
                            anchorEl={menuAnchor}
                            setAnchorEl={setMenuAnchor}
                            menuId={menuId}
                            setMenuId={setMenuId}
                          />
                        )}
                      </span>
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
          ))}
        </ul>
      </List>
    </div>
  );
};

export default HistorySidebar;
