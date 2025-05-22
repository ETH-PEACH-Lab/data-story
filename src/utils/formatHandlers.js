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