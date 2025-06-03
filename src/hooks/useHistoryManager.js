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

export function useHistoryManager({
    hotRef,
    initializeColumns,
    updateHist,
    userName,
    originalFileName,
    requestConfirmation,
    sharedArray,
    setData,
    setColumnConfigs,
    setActions,
    setOriginalFileName,
    columnConfigs,
}) {
    const [uploadHistory, setUploadHistory] = useState([]);
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
            hotRef.current.hotInstance.getData(),
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
            message,
            userName
        );

        const undoRedo = hotRef.current?.hotInstance?.undoRedo;
        if (undoRedo) {
            setInitialActionStack([...undoRedo.doneActions]);
            setInitialActionStackLength(undoRedo.doneActions.length);
        }

        setCurrentDataIdLocalStorage(currentDataId);
    }, [
        hotRef,
        originalFileName,
        currentDataId,
        idList,
        updateHist,
        actions,
        initialActionStackLength,
        columnConfigs,
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



    useEffect(() => {
        const savedHistory = getHistoryLocalStorage();
        const savedCurrentDataId = getCurrentDataIdLocalStorage();
        const savedIdList = getIdListLocalStorage();

        setUploadHistory(savedHistory);
        setCurrentDataId(savedCurrentDataId ?? 0);
        setIdList(savedIdList);

        const historyEntry = savedHistory.find((entry) => entry.id === savedCurrentDataId);
        if (historyEntry) {
            switchHistoryEntry(
                historyEntry,
                savedHistory.indexOf(historyEntry),
                setData,
                initializeColumns,
                setColumnConfigs,
                setCurrentDataId,
                setActions,
                setOriginalFileName,
                hotRef,
                setInitialActionStack,
                setInitialActionStackLength
            );
        }
    }, []);

    useEffect(() => {
        setIdListLocalStorage(idList);
    }, [idList]);

    return {
        historyState: {
            uploadHistory,
            setUploadHistory,
            currentDataId,
            setCurrentDataId,
            idList,
            setIdList,
        },
        historyActions: {
            handleSaveCurrentVersion,
            handleHistoryClick,
            handleDeleteAllHistory,
            handleReset
        },
    };
}