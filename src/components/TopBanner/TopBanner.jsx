import React, { useContext, useState } from "react";
import { SharedContext, AppState } from "../../App"; // Update this path if needed
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
  "Why did the price per unit of Apples change?",
  "Who increased the quantity of Watermelons?",
  "What was the quantity of Watermelons before the increase?",
  "How many changes were made on August 13?",
  "How many Peach-related changes were made in total?",
]

function TopBanner() {
  const { awareness, appState, setAppState, historyActions, userName } = useContext(SharedContext);
  const [spreadsheet, setSpreadsheet] = useState("");
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(null);

  const handleSubmit = () => {
    const duration = new Date().getTime() - timer;
    setTimer(new Date().getTime());
    const taskConfig = {
      condition: appState,
      spreadsheet: spreadsheet === travel ? "Travel" : spreadsheet === conference ? "Conference" : "Inventory",
      question: questions[0],
      answer: answer,
      duration: duration,
      type: "task",
      timestamp: new Date().toISOString(),
      user: userName,
      action: "end",
    }
    logActivity(taskConfig)
    setAnswer("")
    setQuestions(questions.slice(1))
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
              historyActions.initializeHistory(e.target.value)
              historyActions.syncHistory(e.target.value)
              setSpreadsheet(e.target.value);
              setTimer(new Date().getTime());
              if (e.target.value === travel) setQuestions(travelQuestions)
              if (e.target.value === conference) setQuestions(conferenceQuestions)
              if (e.target.value === inventory) setQuestions(inventoryQuestions)
              const taskConfig = {
                condition: appState,
                spreadsheet: e.target.value === travel ? "Travel" : e.target.value === conference ? "Conference" : "Inventory",
                type: "task",
                timestamp: new Date().toISOString(),
                user: userName,
                action: "start",
              }
              logActivity(taskConfig)
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
      <div style={{ gap: "1rem", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span>
          {questions[0]}
        </span>
        {questions.length === 0 && (spreadsheet === travel || spreadsheet === conference) &&
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
      </div>
      <UserCircles awareness={awareness} />
    </div>
  );
}


export default TopBanner;
