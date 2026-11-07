import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { CasePage } from "./CasePage";
import "../styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <CasePage />
    </MotionConfig>
  </StrictMode>,
);
