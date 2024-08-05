// utils/storageHandlers.js
export const setHistoryLocalStorage = (history) => {
  console.log('Saving history to localStorage:', history);
  try {
    localStorage.setItem('uploadHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
};

export const getHistoryLocalStorage = () => {
  try {
    const history = localStorage.getItem('uploadHistory');
    console.log('Loading history from localStorage:', history);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
};

export const setCurrentDataIdLocalStorage = (currentDataId) => {
  console.log('Saving currentDataId to localStorage:', currentDataId);
  try {
    localStorage.setItem('currentDataId', currentDataId);
  } catch (error) {
    console.error('Failed to save currentDataId to localStorage:', error);
  }
};

export const getCurrentDataIdLocalStorage = () => {
  try {
    const currentDataId = localStorage.getItem('currentDataId');
    console.log('Loading currentDataId from localStorage:', currentDataId);
    return currentDataId ? parseInt(currentDataId, 10) : null;
  } catch (error) {
    console.error('Failed to load currentDataId from localStorage:', error);
    return null;
  }
};

export const deleteHistoryLocalStorage = () => {
  localStorage.removeItem('uploadHistory');
  localStorage.removeItem('currentDataId');
};
