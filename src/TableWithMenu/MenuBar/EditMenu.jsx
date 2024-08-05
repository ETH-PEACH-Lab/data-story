import React, { useState, useRef, useEffect } from "react";
import styles from "./MenuBar.module.css";
import Headers from "./FormatMenu/Headers";

const EditMenu = ({
  countAndRemoveDuplicates,
  tableContainerRef,
  selectedColumnIndex,
  selectedColumnName,
  handleFindReplace,
  handleUndo,
  handleRedo,
  setColumns,
  hotRef,
}) => {
  const [
    isRemoveDuplicatesDropdownVisible,
    setRemoveDuplicatesDropdownVisible,
  ] = useState(false);
  const [isFindReplaceDropdownVisible, setFindReplaceDropdownVisible] =
    useState(false);
  const [isHeadersDropdownVisible, setHeadersDropdownVisible] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const removeDuplicatesButtonRef = useRef(null);
  const removeDuplicatesDropdownRef = useRef(null);
  const findReplaceButtonRef = useRef(null);
  const findReplaceDropdownRef = useRef(null);
  const headersButtonRef = useRef(null);
  const headersDropdownRef = useRef(null); // Add reference for Headers dropdown

  const handleMenuClick = (item) => {
    if (item === "Remove Duplicates") {
      const duplicates = countAndRemoveDuplicates();
      setDuplicateCount(duplicates);
      setRemoveDuplicatesDropdownVisible(!isRemoveDuplicatesDropdownVisible);
      setFindReplaceDropdownVisible(false);
      setHeadersDropdownVisible(false);
    } else if (item === "Find and Replace") {
      setFindReplaceDropdownVisible(!isFindReplaceDropdownVisible);
      setRemoveDuplicatesDropdownVisible(false);
      setHeadersDropdownVisible(false);
    } else if (item === "Headers") {
      setHeadersDropdownVisible(!isHeadersDropdownVisible);
      setRemoveDuplicatesDropdownVisible(false);
      setFindReplaceDropdownVisible(false);
    } else if (item === "Undo") {
      handleUndo();
    } else if (item === "Redo") {
      handleRedo();
    } else {
      console.log(`${item} clicked`);
    }
  };

  const handleClickOutside = (event) => {
    if (
      !(
        (removeDuplicatesDropdownRef.current &&
          removeDuplicatesDropdownRef.current.contains(event.target)) ||
        (removeDuplicatesButtonRef.current &&
          removeDuplicatesButtonRef.current.contains(event.target)) ||
        (findReplaceDropdownRef.current &&
          findReplaceDropdownRef.current.contains(event.target)) ||
        (findReplaceButtonRef.current &&
          findReplaceButtonRef.current.contains(event.target)) ||
        (headersDropdownRef.current &&
          headersDropdownRef.current.contains(event.target)) || // Check Headers dropdown
        (headersButtonRef.current &&
          headersButtonRef.current.contains(event.target)) || // Check Headers button
        (tableContainerRef.current &&
          tableContainerRef.current.contains(event.target))
      )
    ) {
      setRemoveDuplicatesDropdownVisible(false);
      setFindReplaceDropdownVisible(false);
      setHeadersDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFindReplaceClick = () => {
    handleFindReplace(findText, replaceText);
    setFindReplaceDropdownVisible(false);
  };

  const handleRemoveDuplicates = () => {
    countAndRemoveDuplicates(true);
    setRemoveDuplicatesDropdownVisible(false);
  };

  return (
    <>
      {["Undo", "Redo", "Find and Replace", "Remove Duplicates", "Headers"].map(
        (item, index) => (
          <div
            key={index}
            className={styles.secondaryMenuItem}
            onClick={() => handleMenuClick(item)}
          >
            <button
              ref={
                item === "Remove Duplicates"
                  ? removeDuplicatesButtonRef
                  : item === "Find and Replace"
                  ? findReplaceButtonRef
                  : item === "Headers"
                  ? headersButtonRef
                  : null
              }
              className={styles.button}
            >
              {item}
            </button>
            {item === "Remove Duplicates" &&
              isRemoveDuplicatesDropdownVisible && (
                <div
                  className={styles.Dropdown}
                  style={{
                    top: removeDuplicatesButtonRef.current?.getBoundingClientRect()
                      .bottom,
                    left: removeDuplicatesButtonRef.current?.getBoundingClientRect()
                      .left,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  ref={removeDuplicatesDropdownRef}
                >
                  <div className={styles.textOption}>
                    Number of duplicate rows: {duplicateCount}
                  </div>
                  <div className={styles.textOption}>
                    <button
                      onClick={handleRemoveDuplicates}
                      className={styles.applyButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            {item === "Find and Replace" && isFindReplaceDropdownVisible && (
              <div
                className={styles.Dropdown}
                style={{
                  top: findReplaceButtonRef.current?.getBoundingClientRect()
                    .bottom,
                  left: findReplaceButtonRef.current?.getBoundingClientRect()
                    .left,
                }}
                onClick={(e) => e.stopPropagation()}
                ref={findReplaceDropdownRef}
              >
                <div className={styles.textOption}>
                  <div>
                    {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                      "No column selected"}
                  </div>
                </div>
                <div className={styles.textOption}>
                  <label>Find:</label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                  />
                </div>
                <div className={styles.textOption}>
                  <label>Replace with:</label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                  />
                </div>
                <div className={styles.textOption}>
                  <button
                    onClick={handleFindReplaceClick}
                    className={styles.applyButton}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
            {item === "Headers" && isHeadersDropdownVisible && (
              <Headers
                position={{
                  top: headersButtonRef.current?.getBoundingClientRect().bottom,
                  left: headersButtonRef.current?.getBoundingClientRect().left,
                }}
                stopPropagation={(e) => e.stopPropagation()}
                selectedColumnIndex={selectedColumnIndex}
                selectedColumnName={selectedColumnName}
                setColumns={setColumns}
                hotRef={hotRef}
                ref={headersDropdownRef} // Add reference to Headers dropdown
              />
            )}
          </div>
        )
      )}
    </>
  );
};

export default EditMenu;
