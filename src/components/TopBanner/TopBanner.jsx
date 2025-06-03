import React, { useContext } from "react";
import { SharedContext } from "../../App"; // Update this path if needed
import { UserCircles } from "./UserCircles"; // Ensure this import is correct
import "./TopBanner.css";

function TopBanner() {
  const { awareness } = useContext(SharedContext);

  return (
    <div className="top-banner">
      <h1>Version Brush</h1>
      <UserCircles awareness={awareness} />
    </div>
  );
}


export default TopBanner;
