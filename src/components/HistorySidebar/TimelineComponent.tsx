import { useEffect, useRef } from "react"
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

    const options = {
      zoomMin: 1000 * 60,
      zoomMax: 1000 * 60 * 60 * 24 * 31,
      snap: null,
    }

    const timeline = new Timeline(container, dataSet, options)
    timelineInstanceRef.current = timeline

    const first = items[0].start
    const last = items.at(-1)!.end

    timeline.addCustomTime(first, "start-marker")
    timeline.addCustomTime(last, "end-marker")

    timeline.setCustomTimeTitle("Start Marker", "start-marker")
    timeline.setCustomTimeTitle("End Marker", "end-marker")

    setStart(new Date(first))
    setEnd(new Date(last))

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

  return <div ref={timelineRef} className="h-72" />
}

export default TimelineComponent