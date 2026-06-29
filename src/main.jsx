import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App";
import ResumeBuilder from "./ResumeBuilder";
import TextAnalyzer from "./TextAnalyzer";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/text-analyzer" element={<TextAnalyzer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
