import React, { useState } from "react";
import styles from "./StoryMenu.module.css";

const ChartMenu = ({ addComponent, chartNames = [] }) => {
  const [selectedChartName, setSelectedChartName] = useState("");

  const handleInsertClick = () => {
    addComponent("chart", selectedChartName);
  };

  return (
    <div className={styles.secondaryMenuBar}>
      <div className={`${styles.secondaryMenuItem} ${styles.paddingContainer}`}>
        <select
          value={selectedChartName}
          onChange={(e) => setSelectedChartName(e.target.value)}
          className={styles.selectInput}
        >
          <option value="" disabled>
            Select Chart Name
          </option>
          {chartNames.map((chartName, index) => (
            <option key={index} value={chartName}>
              {chartName}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.secondaryMenuItem}>
        <button className={styles.button} onClick={handleInsertClick}>
          Insert
        </button>
      </div>
    </div>
  );
};

export default ChartMenu;
