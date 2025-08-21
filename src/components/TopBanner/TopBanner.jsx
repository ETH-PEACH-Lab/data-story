import React, { useContext, useState } from "react";
import { SharedContext, AppState, BrushState } from "../../App"; // Update this path if needed
import { UserCircles } from "./UserCircles"; // Ensure this import is correct
import "./TopBanner.css";
import travel from "../../assets/travel.json"
import conference from "../../assets/conference.json"
import inventory from "../../assets/inventory.json"
import { logActivity } from "../../utils/api";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

const travelQuestions = [
  "Who changed the Day 4 Accommodation cost to 100?",
  "Why was the Day 4 Accommodation cost changed to 100?",
  "What was the Day 3 Accommodation cost before it was changed to 200?",
  "Why did the Day 7 Transportation cost increase?",
  "What was the Total Transportation cost before Day 7 Transportation cost was changed to 200?",
  "Which category was added on August 15?",
  "Who was the most active contributor on August 11?",
  "How many edits did Bob make in total?",
  "Who didn’t make any changes related to activities?",
  "How many changes did Bob make on August 13?",
]

const conferenceQuestions = [
  "Who changed the Keynote speaker?",
  "Why was the original Keynote speaker changed?",
  "Who moved Quantum Computing to the afternoon?",
  "Why was Quantum Computing moved to the afternoon?",
  "What was Linux Setup’s original name?",
  "Which timeslot was added on August 14?",
  "Which collaborator was the most active one on August 15?",
  "How many changes did Dave make in total?",
  "Which author made the most formula changes?",
  "How many changes did Frank make on August 13?",
]

const inventoryQuestions = [
  "How many changes did Harry make?",
  "Why did the Price of Apples change?",
  "Who increased the Quantity of Watermelons?",
  "What was the Quantity of Watermelons before the increase?",
  "How many changes were made on August 13?",
  "How many Peach-related changes were made in total?",
]

function TopBanner() {
  const { 
    awareness, 
    appState, 
    setAppState, 
    historyActions, 
    userName, 
    spreadsheet, 
    setSpreadsheet,
    resetBrushing,
  } = useContext(SharedContext);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(null);

  const handleSubmit = () => {
    const duration = new Date().getTime() - timer;
    setTimer(new Date().getTime());

    const taskConfig = {
      user: userName,
      condition: appState,
      spreadsheet: spreadsheet,
      type: "TASK",
      timestamp: new Date().toISOString(),
      question: questions[0],
      answer: answer,
      duration: duration,
      action: "end",
    }
    logActivity(taskConfig)

    setAnswer("")
    setQuestions(questions.slice(1))
    resetBrushing()
  };

  return (
    <div className="top-banner">
      <div className="dropdowns">
        <h1>Version Brush</h1>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Condition</InputLabel>
          <Select
            onChange={(e) => { setAppState(e.target.value) }}
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
              const spreadsheetHistory = e.target.value === "TRAVEL" ? travel :
                e.target.value === "CONFERENCE" ? conference : inventory;
              const spreadsheetQuestions = e.target.value === "TRAVEL" ? travelQuestions :
                e.target.value === "CONFERENCE" ? conferenceQuestions : inventoryQuestions;

              historyActions.initializeHistory(spreadsheetHistory)
              historyActions.syncHistory(spreadsheetHistory)

              setSpreadsheet(e.target.value);
              setQuestions(spreadsheetQuestions)

              resetBrushing()
              setTimer(new Date().getTime());

              const taskConfig = {
                user: userName,
                condition: appState,
                spreadsheet: e.target.value,
                type: "TASK",
                timestamp: new Date().toISOString(),
                action: "start",
              }
              logActivity(taskConfig)
            }}
            label="Spreadsheet"
            value={spreadsheet}
          >
            <MenuItem value={"TRAVEL"}>Travel</MenuItem>
            <MenuItem value={"CONFERENCE"}>Conference</MenuItem>
            <MenuItem value={"INVENTORY"}>Inventory</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div style={{ gap: "1rem", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span>
          {questions[0]}
        </span>
        {questions.length === 0 && (spreadsheet === "TRAVEL" || spreadsheet === "CONFERENCE") &&
          <Link
            href="https://forms.gle/H3WzNUsjcaHZbTHk6"
            target="_blank"
          >
            Post-Task Survey
          </Link>
        }
        {questions.length > 0 && <>
          <TextField
            size="small"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button
            onClick={handleSubmit}>
            Submit
          </Button>
        </>}
        <UserCircles awareness={awareness} />
      </div>
    </div>
  );
}


export default TopBanner;
