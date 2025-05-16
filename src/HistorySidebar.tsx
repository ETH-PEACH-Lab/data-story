import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';

import "./styles/History.css";
import {
  setHistoryLocalStorage,
  clearAllLocalStorage,
} from "./utils/storageHandlers";
import { SharedContext } from "./App";
import { filterHistory, bundleHistoryEntries, getAuthors } from "./utils/historyHandlers";

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

interface HistoryEntry {
  id: number;
  author: string;
  timestamp: string;
  historyMessage: string;
}

interface HistoryBundle {
  startTime: string;
  endTime: string;
  entries: HistoryEntry[];
}

const HistorySidebar = ({
  isHistoryVisible,
  uploadHistory,
  setUploadHistory,
  onHistoryItemClick,
  onHistoryItemDelete,
  toggleHistory,
  currentDataId,
  idList,
  setIdList,
  handleDeleteAllHistory,
  awareness,
  selectEntry,
}) => {
  const [lastSelectedEntry, setLastSelectedEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [bundles, setBundles] = useState<HistoryBundle[]>([]);
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const inputRef = useRef(null);
  const { updateHist } = useContext(SharedContext)
  const listRef = useRef(null);

  useEffect(() => {
    setLastSelectedEntry(currentDataId);
  }, [currentDataId]);

  const saveFileName = useCallback(
    (index: number) => {
      const trimmedFileName = newFileName.trim();
      if (
        trimmedFileName !== "" &&
        trimmedFileName !== uploadHistory[index].fileName
      ) {
        const updatedHistory = [...uploadHistory];
        updatedHistory[index].fileName = trimmedFileName;
        setUploadHistory(updatedHistory);
        updateHist(updatedHistory)
        setHistoryLocalStorage(updatedHistory);
      }
      setEditingIndex(null);
      setNewFileName("");
    },
    [newFileName, uploadHistory, setUploadHistory]
  );

  useOutsideClick(inputRef, () => {
    if (editingIndex !== null) {
      saveFileName(editingIndex);
    }
  });

  const startEditing = (index, fileName) => {
    setEditingIndex(index);
    setNewFileName(fileName);
  };

  const toggleBundle = useCallback((index: number) => {
    const bundleState = [...isOpen]
    bundleState[index] = !bundleState[index]
    setIsOpen(bundleState)
  }, [isOpen]);

  useEffect(() => {
    if (!awareness.current) return;
    const states = awareness.current.getStates();
    const updatedCollaborators = Array.from(states.entries()).map(([clientID, state]) => {
      const name = state.name; // Ensure a default name if not provided
      const color = state.cursor.color; // Get the cursor color
      return { name, color };
    });
    setCollaborators(updatedCollaborators);
  }, [isHistoryVisible]);

  useEffect(() => {
    if (!listRef.current) return
    const lastChild = listRef.current.lastElementChild;
    if (lastChild) lastChild.scrollIntoView({ behavior: "smooth" });
    const bundles = bundleHistoryEntries(uploadHistory)
    setBundles(bundles)
    if (bundles.length > isOpen.length) setIsOpen((prev) => [...prev, ...Array(bundles.length - prev.length).fill(false)]);
  }, [uploadHistory, isHistoryVisible]);

  return (
    <div className={`history-sidebar ${isHistoryVisible ? "visible" : ""}`}>
      <div className="button-container d-flex justify-content-between align-items-center p-2">
        <button
          onClick={toggleHistory}
          className={`btn btn-light ${isHistoryVisible ? "history-visible" : "history-collapsed"
            }`}
        >
          {isHistoryVisible ? "Hide History" : "Show History"}
        </button>
        {isHistoryVisible && (
          <button onClick={handleDeleteAllHistory} className="btn btn-danger">
            <i className="bi bi-trash3"></i> Delete All
          </button>
        )}
      </div>
      {isHistoryVisible && (
        <List>
          <ul className="list-group w-100" ref={listRef}>
            {bundles.map((bundle, index) => (
              <>
                <ListItemButton onClick={() => toggleBundle(index)}>
                  <ListItemIcon>
                    {isOpen[index] ? <ExpandMore /> : <ChevronRight />}
                  </ListItemIcon>
                  <ListItemText primary={getAuthors(bundle)}
                    secondary={
                      `${bundle.startTime.substring(0, bundle.startTime.length - 3)}
                         - ${bundle.endTime.substring(11, bundle.endTime.length - 3)}`
                    }
                  />
                </ListItemButton>
                <Collapse in={isOpen[index]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {filterHistory(bundle.entries).map((entry: HistoryEntry) => (
                      <ListItemButton
                        sx={{ ml: 9 }}
                        className={entry.id === selectedId ? "bg-success" : ""}
                        onClick={() => { selectEntry(entry); setSelectedId(entry.id) }}
                      >
                        <ListItemText
                          primary={
                            `${entry.author} - ${entry.timestamp.substring(11, entry.timestamp.length - 3)}`
                          }
                          secondary={entry.historyMessage}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ))}
          </ul>
        </List>
      )}
    </div>
  );
};

export default HistorySidebar;
