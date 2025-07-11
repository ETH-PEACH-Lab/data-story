import Button from '@mui/material/Button'
import Bolt from '@mui/icons-material/Bolt'
import Check from '@mui/icons-material/Check'
import Replay from '@mui/icons-material/Replay'
import { BrushState } from "../App"

interface VBrushProps {
  brushState: BrushState
  setBrushState: (state: BrushState) => void
  applyBrushing: () => void
  resetBrushing: () => void
  viewCurrentVersion: () => void
}

const VBrush = ({
  brushState,
  setBrushState,
  applyBrushing,
  resetBrushing,
  viewCurrentVersion,
}: VBrushProps) => <>
    {brushState === BrushState.IDLE &&
      <Button
        variant="contained"
        startIcon={<Bolt />}
        sx={{ backgroundColor: "black", textTransform: "none" }}
        onClick={() => { setBrushState(BrushState.BRUSHING); viewCurrentVersion() }}
      >
        VBrush
      </Button>}
    {brushState === BrushState.BRUSHING &&
      <Button
        variant="contained"
        startIcon={<Check />}
        sx={{ backgroundColor: "rgb(232, 185, 49)", textTransform: "none" }}
        onClick={() => { setBrushState(BrushState.BRUSHED); applyBrushing() }}
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
  </>

export default VBrush