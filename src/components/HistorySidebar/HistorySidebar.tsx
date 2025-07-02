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
import { SharedContext } from "../../App";
import { filterHistory, bundleHistoryEntries, getAuthors, getAllAuthors } from "../../utils/historyHandlers";
import { getTime, getInterval } from "../../utils/formatHandlers"

import "./HistorySidebar.css";
import CollaboratorBrush from "../CollaboratorBrush"
import TimeBrush from "../TimeBrush"
import HistoryMenu from "./HistoryMenu"

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

interface HistoryBundle {
  startTime: string;
  endTime: string;
  entries: HistoryEntry[];
}

const HistorySidebar = ({
  selectEntry,
}: {
  selectEntry: (entry: HistoryEntry | null) => void;
}) => {
  const [bundles, setBundles] = useState<HistoryBundle[]>([]);
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [interval, setInterval] = useState<number>(-1)
  const [editingEntryId, setEditingEntryId] = useState<number>(-1)
  const [editingMessage, setEditingMessage] = useState<string>("")
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuId, setMenuId] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null);
  const {
    historyState,
    historyActions
  } = useContext(SharedContext);

  const { uploadHistory, setUploadHistory } = historyState;
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
    if (bundles.length > isOpen.length) setIsOpen((prev) => [...prev, ...Array(bundles.length - prev.length).fill(false)]);
  }, [uploadHistory]);

  useEffect(() => {
    if (editingEntryId >= 0 && inputRef.current) inputRef.current.focus()
  }, [editingEntryId])

  useEffect(() => {
    console.log(selectedId, "selectedId")
  }, [selectedId])

  const handleHistoryItemClick = (entry: HistoryEntry) => {
    if (selectedId !== entry.id) {
      selectEntry(entry)
      setSelectedId(entry.id)
      handleHistoryClick(entry, -1)
    } else {
      setSelectedId(-1)
      selectEntry(null)
      handleHistoryClick(uploadHistory[uploadHistory.length - 1], -1)
    }
  }

  return (
    <div className={"history-sidebar"}>
      <div className="button-container d-flex justify-content-between align-items-center p-2">
        <strong>Editing History</strong>
        <TimeBrush
          time={interval}
          setTime={setInterval}
        />
        <CollaboratorBrush
          authors={selectedAuthors}
          setAuthors={setSelectedAuthors}
          allAuthors={getAllAuthors(uploadHistory)}
        />
      </div>
      <List>
        <ul className="list-group w-100" ref={listRef}>
          {filterHistory(bundles, selectedAuthors, interval).slice().reverse().map((bundle: HistoryBundle, index: number) => (
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
                        primary={`${entry.author} - ${getTime(entry.date)}`}
                        secondary={
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
                            entry.historyMessage
                          )
                        }
                      />
                      <HistoryMenu
                        entry={entry}
                        handleEdit={handleEdit}
                        handleMerge={handleMerge}
                        anchorEl={menuAnchor}
                        setAnchorEl={setMenuAnchor}
                        menuId={menuId}
                        setMenuId={setMenuId}
                      />
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
