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
import { filterHistory, bundleHistoryEntries, getAuthors, getAllAuthors } from "../../utils/historyHandlers";
import { getTime, getInterval } from "../../utils/formatHandlers"

import "./HistorySidebar.css";
import CollaboratorBrush from "../CollaboratorBrush"
import TimeBrush from "../TimeBrush"

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
  selectEntry,
}) => {
  const [lastSelectedEntry, setLastSelectedEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [bundles, setBundles] = useState<HistoryBundle[]>([]);
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [selectedId, setSelectedId] = useState(-1);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [interval, setInterval] = useState<number>(-1)

  const inputRef = useRef(null);
  const {
    historyState,
    historyActions
  } = useContext(SharedContext);

  const { uploadHistory, currentDataId, idList } = historyState;
  const {
    setUploadHistory,
    handleHistoryClick,
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

  const toggleBundle = useCallback((index: number) => {
    const bundleState = [...isOpen]
    bundleState[index] = !bundleState[index]
    setIsOpen(bundleState)
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) return
    // const lastChild = listRef.current.lastElementChild;
    // if (lastChild) lastChild.scrollIntoView({ behavior: "smooth" });
    console.log("USEEFFECT HAS BEEN TRIGGERED")
    const bundles = bundleHistoryEntries(uploadHistory)
    setBundles(bundles)
    if (bundles.length > isOpen.length) setIsOpen((prev) => [...prev, ...Array(bundles.length - prev.length).fill(false)]);
  }, [uploadHistory]);

  const handleHistoryItemClick = (entry: HistoryEntry) => {
    selectEntry(entry)
    setSelectedId(entry.id)
    handleHistoryClick(entry, -1)
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
          {/* <button onClick={handleDeleteAllHistory} className="btn btn-danger">
            <i className="bi bi-trash3"></i> Delete All
          </button> */}
      </div>
        <List>
          <ul className="list-group w-100" ref={listRef}>
            {filterHistory(bundles, selectedAuthors, interval).slice().reverse().map((bundle, index) => (
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
                    {bundle.entries.slice().reverse().map((entry: HistoryEntry, i) => (
                      <ListItemButton
                        key={entry.id}
                        sx={{ ml: 9 }}
                        className={entry.id === selectedId ? "bg-success" : ""}
                        onClick={() => { handleHistoryItemClick(entry) }}
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
    </div>
  );
};

export default HistorySidebar;
