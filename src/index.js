// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // This will resolve to App.js automatically
import "./styles/main.css"; // Use your custom CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
