import { useCallback, useState, useEffect } from "react";
import {
    saveDataToHistory,
    switchHistoryEntry,
} from "../utils/historyHandlers";
import {
    getHistoryLocalStorage,
    getIdListLocalStorage,
    clearAllLocalStorage,
    generateEmptyDataset
} from "../utils/storageHandlers";
import fallback from "../assets/fallback.json"

export function useHistoryManager({
    data,
    hotRef,
    initializeColumns,
    updateHist,
    userName,
    originalFileName,
    sharedArray,
    setData,
    setColumnConfigs,
    setCellFormat,
    setActions,
    setOriginalFileName,
    columnConfigs,
    cellFormat,
}) {
    const [uploadHistory, setUploadHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [isRedoEmpty, setIsRedoEmpty] = useState(true);
    const [isUndoEmpty, setIsUndoEmpty] = useState(true);
    const [idList, setIdList] = useState(getIdListLocalStorage());
    const [currentDataId, setCurrentDataId] = useState(0);
    const [initialActionStack, setInitialActionStack] = useState([]);
    const [initialActionStackLength, setInitialActionStackLength] = useState(0);
    const [actions, setLocalActions] = useState([]);

    const handleReset = useCallback(() => {
        const { data: emptyData } = generateEmptyDataset();

        // 1. Reset shared Yjs array
        sharedArray.current.delete(0, sharedArray.current.length);
        emptyData.forEach(row => {
            sharedArray.current.push([row]);
        });

        console.log('✅ sharedArray after push:', sharedArray.current.toJSON());


        // 2. Reset local app state
        console.log('🧪 setData will receive:', emptyData);
        setData(emptyData);
        setUploadHistory([]);
        setCurrentDataId(0);
        const columns = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)); // 'A' to 'E'

        setColumnConfigs(columns.map(key => ({
            data: key,
            title: key,
            width: 100,
        })));
        setActions([]);
        setOriginalFileName("");
        clearAllLocalStorage();
        updateHist([]);
    }, [
        sharedArray, // include in deps
        setData,
        setUploadHistory,
        setIdList,
        setCurrentDataId,
        setColumnConfigs,
        setActions,
        setOriginalFileName,
        updateHist
    ]);

    const addLogEntry = (message, selection, updatedCellFormat) => {
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
            initialActionStackLength,
            hotRef,
            columnConfigs,
            updatedCellFormat || cellFormat,
            message,
            userName,
            selection,
        )
        setRedoHistory([])
    }

    const handleSaveCurrentVersion = useCallback((message = "Manual Save") => {
        if (!hotRef.current) return;
        console.log(hotRef.current)

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
            initialActionStackLength,
            hotRef,
            columnConfigs,
            cellFormat,
            message,
            userName
        );

        const undoRedo = hotRef.current?.hotInstance?.undoRedo;
        if (undoRedo) {
            setInitialActionStack([...undoRedo.doneActions]);
            setInitialActionStackLength(undoRedo.doneActions.length);
        }

        setRedoHistory([])
    }, [
        hotRef,
        originalFileName,
        currentDataId,
        idList,
        updateHist,
        actions,
        initialActionStackLength,
        columnConfigs,
        cellFormat,
        userName,
    ]);

    const handleHistoryClick = useCallback((historyEntry, index, switchToPage) => {
        const undoRedo = hotRef.current?.hotInstance?.undoRedo;

        const performSwitch = () => {

            switchHistoryEntry(
                historyEntry,
                uploadHistory.indexOf(historyEntry),
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
            );

        };

        performSwitch();
    }, [
        hotRef,
        initialActionStack,
        handleSaveCurrentVersion,
        uploadHistory,
    ]);

    const handleUndo = () => {
        const len = uploadHistory.length
        const newDataId = uploadHistory[len - 2]["id"]

        setData(uploadHistory[len - 2]["data"])
        setCellFormat(uploadHistory[len - 2]["cellFormat"])
        setCurrentDataId(newDataId)

        setRedoHistory((prev) => [...prev, uploadHistory[len - 1]])
        setUploadHistory((prev) => prev.slice(0, -1))
    }

    const handleRedo = () => {
        const len = redoHistory.length
        const newEntry = redoHistory[len - 1]
        const newDataId = newEntry["id"]

        setCurrentDataId(newDataId)
        setData(newEntry["data"])
        setCellFormat(newEntry["cellFormat"])

        saveDataToHistory(
            newEntry["data"],
            originalFileName,
            newDataId,
            setUploadHistory,
            setCurrentDataId,
            idList,
            setIdList,
            updateHist,
            actions,
            originalFileName,
            initialActionStackLength,
            hotRef,
            columnConfigs,
            newEntry["cellFormat"],
            newEntry["historyMessage"],
            userName
        )

        setRedoHistory(redoHistory.slice(0, -1))
    }

    const initializeHistory = (history) => {
        setUploadHistory(history)
        console.log(history)
        const historyEntry = history.at(-1)
        switchHistoryEntry(
            historyEntry,
            history.indexOf(historyEntry),
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
        )
    }

    useEffect(() => {
        const savedHistory = getHistoryLocalStorage();

        if (savedHistory.length === 0) initializeHistory(fallback.uploadHistory)
        else initializeHistory(savedHistory)
    }, []);

    useEffect(() => {
        setIsRedoEmpty(redoHistory.length === 0);
        setIsUndoEmpty(uploadHistory.length === 0);
    }, [redoHistory, uploadHistory]);

    return {
        historyState: {
            uploadHistory,
            setUploadHistory,
            currentDataId,
            setCurrentDataId,
            idList,
            setIdList,
            isRedoEmpty,
            isUndoEmpty,
        },
        historyActions: {
            handleSaveCurrentVersion,
            handleHistoryClick,
            handleReset,
            handleUndo,
            handleRedo,
            initializeHistory,
            addLogEntry,
        },
    };
}