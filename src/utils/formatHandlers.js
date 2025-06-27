export const getTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export const getDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
  })
}

export const getInterval = (start, end) => {
  const date = getDate(start)
  const startTime = getTime(start)
  const endTime = getTime(end)
  return `${date}, ${startTime} - ${endTime}`
}

export const toggleCellFormat = (setFormat, sel, attr, val) => {
  sel.current.forEach((cell) => {
    const [row, col] = cell
    const key = `${row},${col}`;
    setFormat((prev) => {
      if (val) return {...prev, [key]: {...prev[key], [attr]: val}}
      return {... prev, [key]: {...prev[key], [attr]: !prev[key]?.[attr]}}
    })
  })
}

export const calculateCellFormat = (prevFormat, sel, attr, val) => {
  const updatedFormat = {...prevFormat}
  sel.current.forEach((cell) => {
    const [row, col] = cell
    const key = `${row},${col}`;
    updatedFormat[key] = {
      ...updatedFormat[key],
      [attr]: val !== undefined ? val : !updatedFormat[key]?.[attr]
    }
  })
  return updatedFormat
}