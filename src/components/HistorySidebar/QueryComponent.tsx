import { getTime, getDate } from "../../utils/formatHandlers"

interface QueryComponentProps {
  brushedCells: number[][]
  selectedCollaborators: string[]
  intervalStart: Date | null
  intervalEnd: Date | null
  brushedWord: string
}

const getRow = (index: number) => index + 1

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const getCol = (index: number) => letters[index]

const getCell = ([row, col]: number[]) => {
  return getCol(col) + getRow(row)
}

const QueryComponent = ({
  brushedCells,
  selectedCollaborators,
  intervalStart,
  intervalEnd,
  brushedWord,
}: QueryComponentProps) => {

  return <div style={{ padding: "1rem", lineHeight: "2" }} >
    <span>Edits </span>
    {brushedCells.length > 0 && <>
      <span>on </span>
      {brushedCells.map((indices, index) => <span key={index}><span className="query-element">{getCell(indices)}</span><span>, </span></span>)}
    </>}
    {selectedCollaborators.length > 0 && <>
      <span>by </span>
      {selectedCollaborators.map((collaborator, index) => <span key={index}><span className="query-element">{collaborator}</span><span>, </span></span>)}
    </>}
    <span>during </span>
    <span className="query-element">{getDate(intervalStart)}, {getTime(intervalStart)} - {getDate(intervalEnd)}, {getTime(intervalEnd)}</span>
    {brushedWord && <>
      <span>, related to </span>
      <span className="query-element">{brushedWord}</span>
    </>}
  </div>
}

export default QueryComponent
