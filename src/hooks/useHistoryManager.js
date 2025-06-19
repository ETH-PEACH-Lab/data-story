import { useCallback, useState, useEffect } from "react";
import {
    saveDataToHistory,
    areActionStacksEqual,
    switchHistoryEntry,
} from "../utils/historyHandlers";
import {
    getHistoryLocalStorage,
    getCurrentDataIdLocalStorage,
    getIdListLocalStorage,
    setCurrentDataIdLocalStorage,
    setIdListLocalStorage,
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
    requestConfirmation,
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
        setIdList([]);
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

        setCurrentDataIdLocalStorage(currentDataId);
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

            setCurrentDataIdLocalStorage(historyEntry.id);
        };

        if (undoRedo && !areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
            requestConfirmation(
                "You have unsaved changes. Save them?",
                () => {
                    handleSaveCurrentVersion("Unsaved changes saved");
                    performSwitch();
                },
                performSwitch
            );
        } else {
            performSwitch();
        }
    }, [
        hotRef,
        initialActionStack,
        handleSaveCurrentVersion,
        uploadHistory,
        requestConfirmation,
    ]);

    const handleDeleteAllHistory = useCallback(() => {
        requestConfirmation(
            "Delete all history?",
            () => {
                setUploadHistory([]);
                setIdList([]);
                setCurrentDataId(0);
                clearAllLocalStorage();
                updateHist([]);
            }
        );
    }, [requestConfirmation, updateHist]);

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
            newEntry["historyMessage"],
            userName
        )

        setRedoHistory(redoHistory.slice(0, -1))
    }

    const initializeHistory = (history, currentId, ids) => {
        setUploadHistory(history)
        setCurrentDataId(currentId)
        setIdList(ids)
        const historyEntry = history.find((entry) => entry.id === currentId)
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
        const savedCurrentDataId = getCurrentDataIdLocalStorage();
        const savedIdList = getIdListLocalStorage();

        if (savedHistory.length === 0) initializeHistory(fallback.uploadHistory, fallback.currentDataId, fallback.idList)
        else initializeHistory(savedHistory, savedCurrentDataId ?? 0, savedIdList)
    }, []);

    useEffect(() => {
        setIdListLocalStorage(idList);
    }, [idList]);

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
            handleDeleteAllHistory,
            handleReset,
            handleUndo,
            handleRedo,
            initializeHistory,
        },
    };
}