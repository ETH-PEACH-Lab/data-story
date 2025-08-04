import { useEffect, useRef } from "react"
import { getDate, getTime } from "../../utils/formatHandlers"

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

const drawSelectionOverlay = (timeline: Timeline) => {
  const containerRect = timeline.dom.root;
  const startEl = containerRect.querySelector('.vis-custom-time.start-marker') as HTMLElement;
  const endEl = containerRect.querySelector('.vis-custom-time.end-marker') as HTMLElement;
  if (!startEl || !endEl) return;
  const startLeft = startEl.getBoundingClientRect().left - containerRect.getBoundingClientRect().left;
  const endLeft = endEl.getBoundingClientRect().left - containerRect.getBoundingClientRect().left;
  containerRect.querySelectorAll('.custom-range-overlay').forEach(el => el.remove());
  const selectionDiv = document.createElement('div');
  selectionDiv.style.position = 'absolute';
  selectionDiv.style.top = '0';
  selectionDiv.style.bottom = '0';
  selectionDiv.style.background = 'rgba(255, 230, 0, 0.1)';
  selectionDiv.style.border = '1px solid #f8c200';
  selectionDiv.style.zIndex = '1';
  selectionDiv.className = 'custom-range-overlay';
  containerRect.appendChild(selectionDiv);

  selectionDiv.style.left = `${startLeft}px`;
  selectionDiv.style.width = `${endLeft - startLeft + 1}px`;
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

    const startMarker = addHours(items[0].start, -0.5)
    const endMarker = addHours(items.at(-1)!.end, 0.5)

    const startTime = addHours(startMarker, -0.5)
    const endTime = addHours(endMarker, 0.5)

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

    // timeline.setCustomTimeMarker("start", "start-marker")
    // timeline.setCustomTimeMarker("end", "end-marker")

    setStart(new Date(startMarker))
    setEnd(new Date(endMarker))

    setTimeout(() => {
      drawSelectionOverlay(timeline)
    }, 2000) // Wait for the timeline to render

    timeline.on("timechange", (event) => {
      if (event.id === "start-marker") setStart(event.time)
      if (event.id === "end-marker") setEnd(event.time)
    })
  timeline.on("changed", () => {
    drawSelectionOverlay(timeline)
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
      if (timelineInstanceRef.current) {
        drawSelectionOverlay(timelineInstanceRef.current)
      }
    })
  }, [start, end])

  return (
    <div>
    <div ref={timelineRef} />
    <div
      style={{
        marginTop: '8px',
        fontSize: '14px',
        color: '#333',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>
        <strong>Start:</strong> {getDate(start)}, {getTime(start)}
      </span>
      <span>
        <strong>End:</strong> {getDate(end)}, {getTime(end)}
      </span>
    </div>
  </div>
)}

export default TimelineComponent