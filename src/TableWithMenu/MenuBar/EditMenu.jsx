import React, { useState, useRef, useEffect } from "react";
import styles from "./MenuBar.module.css";
import Headers from "./FormatMenu/Headers";

const EditMenu = ({
  countAndRemoveDuplicates,
  tableContainerRef,
  selectedColumnIndex,
  selectedColumnName,
  handleFindReplace,
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
  const headersDropdownRef = useRef(null);

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
          headersDropdownRef.current.contains(event.target)) ||
        (headersButtonRef.current &&
          headersButtonRef.current.contains(event.target)) ||
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
    <div className="d-flex gap-2">
      {["Find and Replace", "Remove Duplicates", "Headers"].map(
        (item, index) => (
          <button
            key={index}
            className="btn btn-outline-secondary"
            onClick={() => handleMenuClick(item)}
            ref={
              item === "Remove Duplicates"
                ? removeDuplicatesButtonRef
                : item === "Find and Replace"
                ? findReplaceButtonRef
                : item === "Headers"
                ? headersButtonRef
                : null
            }
          >
            {item}
          </button>
        )
      )}

      {isRemoveDuplicatesDropdownVisible && (
        <div
          className="dropdown-menu show"
          style={{
            top: `${
              removeDuplicatesButtonRef.current?.getBoundingClientRect()
                .bottom +
              window.scrollY -
              68
            }px`,
            left: `${
              removeDuplicatesButtonRef.current?.getBoundingClientRect().left +
              window.scrollX -
              23
            }px`,
          }}
          onClick={(e) => e.stopPropagation()}
          ref={removeDuplicatesDropdownRef}
        >
          <div className="dropdown-item">
            Number of duplicate rows: {duplicateCount}
          </div>
          <div className="dropdown-item">
            <button
              onClick={handleRemoveDuplicates}
              className="btn btn-primary"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {isFindReplaceDropdownVisible && (
        <div
          className="dropdown-menu show"
          style={{
            top: `${
              findReplaceButtonRef.current?.getBoundingClientRect().bottom +
              window.scrollY -
              68
            }px`,
            left: `${
              findReplaceButtonRef.current?.getBoundingClientRect().left +
              window.scrollX -
              23
            }px`,
            position: "absolute",
          }}
          ref={findReplaceDropdownRef}
        >
          <div className="dropdown-item">
            <div>
              {`Selected column: index ${selectedColumnIndex}, ${selectedColumnName}` ||
                "No column selected"}
            </div>
          </div>
          <div className="dropdown-item">
            <label>Find:</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="dropdown-item">
            <label>Replace with:</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="dropdown-item">
            <button
              onClick={handleFindReplaceClick}
              className="btn btn-primary"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {isHeadersDropdownVisible && (
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
          ref={headersDropdownRef}
        />
      )}
    </div>
  );
};

export default EditMenu;
