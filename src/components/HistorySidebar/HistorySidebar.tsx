import React, { useState, useEffect, useRef, useCallback, useContext } from "react";

import List from '@mui/material/List';
import { IconButton } from '@mui/material';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';


import { setHistoryLocalStorage } from "../../utils/storageHandlers";
import { SharedContext, getColor, BrushState } from "../../App";
import {
  filterHistory,
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
import { CircleComponent } from "../../components/TopBanner/UserCircles";
import { Typography } from "@mui/material";

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
  date: Date
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
  setBrushedCells: (cells: number[][]) => void
}

const HistorySidebar = ({
  selectEntry,
  brushState,
  setBrushState,
  setBrushedCells,
}: HistorySidebarProps) => {
  const [bundles, setBundles] = useState<HistoryBundle[]>([]);
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const [intervalStart, setIntervalStart] = useState<Date | null>(null)
  const [intervalEnd, setIntervalEnd] = useState<Date | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<number>(-1)
  const [editingMessage, setEditingMessage] = useState<string>("")
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuId, setMenuId] = useState(-1)
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [diffMode, setDiffMode] = useState<"before" | "after">("after");


  const inputRef = useRef<HTMLInputElement>(null);
  const {
    historyState,
    historyActions,
    brushedCells,
  } = useContext(SharedContext);

  const {
    uploadHistory,
    setUploadHistory,
  } = historyState;
  const {
    handleHistoryClick,
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

      setHistoryLocalStorage(updatedHistory)
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
      setHistoryLocalStorage(updatedHistory)
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
    if (editingEntryId >= 0 && inputRef.current) inputRef.current.focus()
  }, [editingEntryId])

  const viewCurrentVersion = () => {
    setSelectedId(-1)
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
      }
    }
    else {
      handleHistoryClick(entry, -1) // Switch to the current entry
    }
    setDiffMode((prev) => (prev === "before" ? "after" : "before"));
  }

  const handleHistoryItemClick = (entry: HistoryEntry) => {
    setDiffMode("after");
    if (brushState === BrushState.BRUSHING) return
    if (selectedId !== entry.id) {
      selectEntry(entry)
      setSelectedId(entry.id)
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
    setSelectedKeyword("")
  }

  const findCollaboratorColor = (author: string): string => {
    return allCollaborators.find((collab: { name: string; }) => collab.name === author)?.color || getColor(author);
  }

  // Helper to render authors blob with color dots for each author
  const getAuthorsBlob = (bundle: HistoryBundle) => {
    const authorsString = getAuthors(bundle);
    const authors = authorsString.split(/,\s*/);
    return (
      <span>
        {authors.map((author, idx) => (
          <span
            key={author}
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

  return (
    <div className={"history-sidebar"}>
      <div className="button-container d-flex justify-content-between align-items-center p-2 pb-3">
        <strong>Editing History</strong>
        <VBrush
          brushState={brushState}
          setBrushState={setBrushState}
          resetBrushing={resetBrushing}
          viewCurrentVersion={viewCurrentVersion}
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
      <List>
        <ul className="list-group w-100" ref={listRef}>
          {filterHistory(
            bundles,
            selectedCollaborators,
            intervalStart,
            intervalEnd,
            brushedCells,
            selectedKeyword,
            brushState
          ).slice().reverse().map((bundle: HistoryBundle, index: number) => (
            <div key={bundle.startTime}>
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
                  {bundle.entries.slice().reverse().map((entry: HistoryEntry) => (
                    <ListItemButton
                      key={entry.id}
                      sx={{ ml: 9, position: 'relative', display: 'flex', alignItems: 'center' }}
                      className={entry.id === selectedId ? "bg-success history-entry" : "history-entry"}
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
                            {getAuthorsBlob(bundle)}<span>{' - '}{getTime(entry.date)}</span>
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
                              component="span"
                              sx={{ userSelect: brushState === BrushState.BRUSHING ? "text" : "" }}
                              onMouseUp={() => setSelectedKeyword(window.getSelection()?.toString() || "")}
                            >
                              {entry.historyMessage}
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
