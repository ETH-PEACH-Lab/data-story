import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/custom.scss";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
      rel="stylesheet"
    />
    <App />
  </React.StrictMode>
);
