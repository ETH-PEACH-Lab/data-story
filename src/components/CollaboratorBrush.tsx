import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const CollaboratorBrush = (
    { authors, allAuthors, setAuthors }
        : { authors: string[], allAuthors: string[], setAuthors: (authors: string[]) => void }
) => {

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const { target: { value } } = event;
        setAuthors(value as string[])
    }

    return (
        <div>
            <FormControl sx={{ m: 1, width: 240 }}>
                <InputLabel>Brush by Collaborator</InputLabel>
                <Select
                    multiple
                    value={authors}
                    onChange={handleChange}
                    input={<OutlinedInput label="Brush by Collaborator" />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {allAuthors.slice().reverse().map((name: string) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={authors?.includes(name)} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}

export default CollaboratorBrush