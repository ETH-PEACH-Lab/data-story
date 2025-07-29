import React, { useState, useEffect, useRef, useCallback, useContext } from "react";

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';

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

  const handleHistoryItemClick = (entry: HistoryEntry) => {
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
              <ListItemButton onClick={() => toggleBundle(index)}>
                <ListItemIcon>
                  {isOpen[index] ? <ExpandMore /> : <ChevronRight />}
                </ListItemIcon>
                <ListItemText primary={getAuthors(bundle)}
                  secondary={
                    getInterval(bundle.startTime, bundle.endTime)
                  }
                />
              </ListItemButton>
              <Collapse in={isOpen[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {bundle.entries.slice().reverse().map((entry: HistoryEntry) => (
                    <ListItemButton
                      key={entry.id}
                      sx={{ ml: 9 }}
                      className={entry.id === selectedId ? "bg-success" : ""}
                      onClick={() => handleHistoryItemClick(entry)}
                      selected={entry.id === selectedId}
                    >
                      <ListItemText
                        secondary={`${entry.author} - ${getTime(entry.date)}`}
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
                      {brushState === BrushState.IDLE && <HistoryMenu
                        entry={entry}
                        handleEdit={handleEdit}
                        handleMerge={handleMerge}
                        anchorEl={menuAnchor}
                        setAnchorEl={setMenuAnchor}
                        menuId={menuId}
                        setMenuId={setMenuId}
                      />}
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
