import { BrushState, AppState } from "../App"

import Button from '@mui/material/Button'
import Bolt from '@mui/icons-material/Bolt'
import Check from '@mui/icons-material/Check'
import Replay from '@mui/icons-material/Replay'

interface VBrushProps {
  brushState: BrushState
  setBrushState: (state: BrushState) => void
  resetBrushing: () => void
  viewCurrentVersion: () => void
  openBundles: () => void
  appState: AppState
}

const VBrush = ({
  brushState,
  setBrushState,
  resetBrushing,
  viewCurrentVersion,
  openBundles,
  appState,
}: VBrushProps) => {


  return <div style={{ visibility: appState === AppState.BASELINE ? "hidden" : "visible" }}>
    {brushState === BrushState.IDLE &&
      <Button
        variant="contained"
        startIcon={<Bolt />}
        sx={{ backgroundColor: "black", textTransform: "none" }}
        onClick={() => { setBrushState(BrushState.BRUSHING); viewCurrentVersion(); openBundles() }}
      >
        VBrush
      </Button>}
    {brushState === BrushState.BRUSHING &&
      <Button
        variant="contained"
        startIcon={<Check />}
        sx={{ backgroundColor: "rgb(232, 185, 49)", textTransform: "none" }}
        onClick={() => { setBrushState(BrushState.BRUSHED); openBundles() }}
      >
        Apply
      </Button>}
    {brushState === BrushState.BRUSHED &&
      <Button
        variant="contained"
        startIcon={<Replay />}
        sx={{ backgroundColor: "grey", textTransform: "none" }}
        onClick={() => { setBrushState(BrushState.IDLE); resetBrushing() }}
      >
        Reset
      </Button>}
  </div>
}

export default VBrush
