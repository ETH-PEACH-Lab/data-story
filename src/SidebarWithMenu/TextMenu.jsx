import React from "react";
import styles from "./StoryMenu.module.css";

const TextMenu = ({ addComponent }) => {
  return (
    <div className={styles.secondaryMenuBar}>
      <button className={styles.button} onClick={() => addComponent("text")}>
        Add Text
      </button>
    </div>
  );
};

export default TextMenu;
