import React from "react";
import styles from "./StoryMenu.module.css";

const ChartMenu = ({ addComponent }) => {
  return (
    <div className={styles.secondaryMenuBar}>
      <button className={styles.button} onClick={() => addComponent("chart")}>
        Add Chart
      </button>
    </div>
  );
};

export default ChartMenu;
