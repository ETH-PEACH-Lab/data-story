import { useEffect, useRef } from "react"

import { addHours } from "../../utils/formatHandlers"

import { Timeline } from "vis-timeline/standalone"
import { DataSet } from "vis-data"

export interface HistoryBundleLite {
  id: string
  start: string
  end: string
  content: string
  [key: string]: any
}

interface TimelineComponentProps {
  items: HistoryBundleLite[]
  start: Date | null
  end: Date | null
  setStart: (start: Date) => void
  setEnd: (end: Date) => void
}

const TimelineComponent = ({ items, start, end, setStart, setEnd }: TimelineComponentProps) => {
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const timelineInstanceRef = useRef<Timeline | null>(null)
  const itemsRef = useRef<DataSet<HistoryBundleLite, string> | null>(null)

  useEffect(() => {
    if (!timelineRef.current) return
    if (timelineInstanceRef.current) return

    const container = timelineRef.current;
    const dataSet = new DataSet(items)
    itemsRef.current = dataSet

    const startMarker = addHours(items[0].start, -10)
    const endMarker = addHours(items.at(-1)!.end, 10)

    const startTime = addHours(startMarker, -10)
    const endTime = addHours(endMarker, 10)

    const options = {
      zoomMin: 1000 * 60,
      zoomMax: 1000 * 60 * 60 * 24 * 31,
      snap: null,
      min: startTime,
      max: endTime,
      start: startTime,
      end: endTime,
      showCurrentTime: false,
      stack: false,
      height: "102px"
    }

    const timeline = new Timeline(container, dataSet, options)
    timelineInstanceRef.current = timeline

    timeline.addCustomTime(startMarker, "start-marker")
    timeline.addCustomTime(endMarker, "end-marker")

    timeline.setCustomTimeMarker("start", "start-marker")
    timeline.setCustomTimeMarker("end", "end-marker")

    setStart(new Date(startMarker))
    setEnd(new Date(endMarker))

    timeline.on("timechange", (event) => {
      if (event.id === "start-marker") setStart(event.time)
      if (event.id === "end-marker") setEnd(event.time)
    })
  }, [items])

  useEffect(() => {
    if (!itemsRef.current || !setStart || !setEnd) return;

    itemsRef.current.forEach((item: HistoryBundleLite) => {
      if (!itemsRef.current || start === null || end === null) return
      const itemStart = new Date(item.start)
      const itemEnd = new Date(item.end)

      const isOverlapping = itemStart <= end && start <= itemEnd

      itemsRef.current.update({
        id: item.id,
        className: isOverlapping ? "vis-selected" : null,
      })
    })
  }, [start, end])

  return <div ref={timelineRef} />
}

export default TimelineComponent