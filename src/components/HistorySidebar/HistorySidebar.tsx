import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { setHistoryLocalStorage } from "../../utils/storageHandlers";
import { SharedContext } from "../../App";
import { filterHistory, bundleHistoryEntries, getAuthors } from "../../utils/historyHandlers";
import { getTime, getInterval } from "../../utils/formatHandlers"

import "./HistorySidebar.css";

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
  date: Date
}

interface HistoryBundle {
  startTime: string;
  endTime: string;
  entries: HistoryEntry[];
}

const HistorySidebar = ({
  isHistoryVisible,
  toggleHistory,
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
  const {
    awareness,
    historyState,
    historyActions
  } = useContext(SharedContext);

  const { uploadHistory, currentDataId, idList } = historyState;
  const {
    setUploadHistory,
    setIdList,
    onHistoryItemClick,
    onHistoryItemDelete,
    handleDeleteAllHistory,
  } = historyActions;
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
      const name = state?.name || "Anon";
      const color = state?.cursor?.color || "#ccc";
      return { name, color };
    });

    setCollaborators(updatedCollaborators);
  }, [isHistoryVisible]);

  useEffect(() => {
    if (!listRef.current) return
    const lastChild = listRef.current.lastElementChild;
    if (lastChild) lastChild.scrollIntoView({ behavior: "smooth" });
    console.log("USEEFFECT HAS BEEN TRIGGERED")
    console.log(uploadHistory)
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
              <div key={index}>
                <ListItemButton key={index} onClick={() => toggleBundle(index)}>
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
                    {filterHistory(bundle.entries).map((entry: HistoryEntry, i) => (
                      <ListItemButton
                        key={i}
                        sx={{ ml: 9 }}
                        className={entry.id === selectedId ? "bg-success" : ""}
                        onClick={() => { selectEntry(entry); setSelectedId(entry.id) }}
                      >
                        <ListItemText
                          primary={
                            `${entry.author} - ${getTime(entry.date)}`
                          }
                          secondary={entry.historyMessage}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </ul>
        </List>
      )}
    </div>
  );
};

export default HistorySidebar;
