import React, { useContext, useState } from "react";
import { SharedContext, AppState } from "../../App"; // Update this path if needed
import { UserCircles } from "./UserCircles"; // Ensure this import is correct
import "./TopBanner.css";
import travel from "../../assets/travel.json"
import conference from "../../assets/conference.json"
import inventory from "../../assets/inventory.json"

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

function TopBanner() {
  const { awareness, appState, setAppState, historyActions } = useContext(SharedContext);
  const [spreadsheet, setSpreadsheet] = useState("");

  return (
    <div className="top-banner">
      <div className="dropdowns">
        <h1>Version Brush</h1>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Condition</InputLabel>
          <Select
            onChange={(e) => {setAppState(e.target.value)}}
            label="Condition"
            value={appState}
          >
            <MenuItem value={AppState.EXPERIMENT}>Alpha</MenuItem>
            <MenuItem value={AppState.BASELINE}>Beta</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Spreadsheet</InputLabel>
          <Select
            onChange={(e) => {
              historyActions.initializeHistory(e.target.value)
              historyActions.syncHistory(e.target.value)
              setSpreadsheet(e.target.value);
            }}
            label="Spreadsheet"
            value={spreadsheet}
          >
            <MenuItem value={travel}>Travel</MenuItem>
            <MenuItem value={conference}>Conference</MenuItem>
            <MenuItem value={inventory}>Inventory</MenuItem>
          </Select>
        </FormControl>
      </div>
      <UserCircles awareness={awareness} />
    </div>
  );
}


export default TopBanner;
