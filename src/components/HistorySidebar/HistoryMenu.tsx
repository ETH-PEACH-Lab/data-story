import { HistoryEntry } from "./HistorySidebar"

import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface HistoryMenuProps {
  entry: HistoryEntry
  handleEdit: (entry: any) => void
  handleMerge: (entry: any) => void
  anchorEl: HTMLElement | null
  setAnchorEl: (anchor: HTMLElement | null) => void
  menuId: number
  setMenuId: (id: number) => void
}

const HistoryMenu = (
  { entry, handleEdit, handleMerge, anchorEl, setAnchorEl, menuId, setMenuId }
    : HistoryMenuProps
) => {

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setMenuId(entry.id)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuId(-1)
  }

  const handleMergeItem = (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation()
    handleMerge(entry)
    handleMenuClose()
  }

  const handleEditItem = (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation()
    handleEdit(entry)
  }

  const open = Boolean(anchorEl) && menuId === entry.id

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        style={{ marginLeft: "auto" }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditItem}>
          Edit Message
        </MenuItem>
        <MenuItem onClick={handleMergeItem}>
          Merge Entry
        </MenuItem>
      </Menu>
    </>
  )
}

export default HistoryMenu;
