export const setHistoryLocalStorage = (history) => {
  localStorage.setItem('uploadHistory', JSON.stringify(history));
};

export const getHistoryLocalStorage = () => {
  const history = localStorage.getItem('uploadHistory');
  return history ? JSON.parse(history) : [];
};

export const setCurrentDataIdLocalStorage = (currentDataId) => {
  try {
    localStorage.setItem('currentDataId', currentDataId);
  } catch (error) {
    console.error('Failed to save currentDataId to localStorage:', error);
  }
};

export const getCurrentDataIdLocalStorage = () => {
  try {
    const currentDataId = localStorage.getItem('currentDataId');
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

export const setIdListLocalStorage = (idList) => {
  try {
    localStorage.setItem('idList', JSON.stringify(idList));
  } catch (error) {
    console.error('Failed to save idList to localStorage:', error);
  }
};

export const getIdListLocalStorage = () => {
  try {
    const idList = localStorage.getItem('idList');
    return idList ? JSON.parse(idList) : [1]; // Initial list with length 1
  } catch (error) {
    console.error('Failed to load idList from localStorage:', error);
    return [1, 2]; // Default value with length 1
  }
};
