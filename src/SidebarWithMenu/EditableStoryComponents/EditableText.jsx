import React, { useState, useEffect, useRef } from "react";
import "../Story.css";
import EditMenu from "./EditMenu";
import Quill from "quill";
import "quill/dist/quill.bubble.css";
import "quill/dist/quill.snow.css"; // Importing the Snow theme CSS for color tool

function EditableText({
  textObj,
  onTextChange,
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMenuVisible,
  setVisibleMenuIndex,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ color: [] }],
          ],
        },
        theme: "bubble",
        bounds: containerRef.current, // Use the ref to set bounds
      });

      quillRef.current.on("text-change", () => {
        const htmlContent = quillRef.current.root.innerHTML;
        onTextChange(index, { ...textObj, text: htmlContent });
      });

      if (textObj.text) {
        quillRef.current.root.innerHTML = textObj.text;
      }
    }

    // Clean up on unmount or when isEditing changes
    return () => {
      if (quillRef.current && !isEditing) {
        quillRef.current = null;
      }
    };
  }, [isEditing, index, onTextChange, textObj]);

  useEffect(() => {
    if (quillRef.current && !isEditing) {
      quillRef.current.root.innerHTML = textObj.text;
    }
  }, [textObj.text]);

  useEffect(() => {
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div
      className="editable-text-container"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div className="edit-menu-toggle">
        <button
          onClick={() => setVisibleMenuIndex(isMenuVisible ? null : index)}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      {isMenuVisible && (
        <EditMenu
          index={index}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          setVisibleMenuIndex={setVisibleMenuIndex}
        />
      )}
      <div
        onClick={handleTextClick}
        className="editable-text"
        ref={containerRef}
      >
        {isEditing ? (
          <div ref={editorRef} className="quill-editor-container" />
        ) : (
          <div
            className="story-text"
            style={{ fontSize: textObj.fontSize }}
            dangerouslySetInnerHTML={{ __html: textObj.text }}
          />
        )}
      </div>
    </div>
  );
}

export default EditableText;
