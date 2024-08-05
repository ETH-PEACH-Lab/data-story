import React from "react";
import styles from "./StoryMenu.module.css";

const TextMenu = ({ addComponent }) => {
  return (
    <div className={styles.secondaryMenuBar}>
      <div className={styles.secondaryMenuItem}>
        <button className={styles.button} onClick={() => addComponent("text")}>
          Insert
        </button>
      </div>
    </div>
  );
};

export default TextMenu;
