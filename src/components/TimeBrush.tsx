import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const TimeBrush = ({ time, setTime }: { time: number, setTime: (time: number) => void }) => {

  const handleChange = (event: SelectChangeEvent<number>) => {
    setTime(event.target.value)
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>Brush by Time</InputLabel>
        <Select
          value={time}
          label="Brush by Time"
          onChange={handleChange}
        >
          <MenuItem value={300000}>5 Minutes</MenuItem>
          <MenuItem value={1800000}>30 Minutes</MenuItem>
          <MenuItem value={3600000}>1 Hour</MenuItem>
          <MenuItem value={86400000}>1 Day</MenuItem>
          <MenuItem value={-1}>All</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default TimeBrush 