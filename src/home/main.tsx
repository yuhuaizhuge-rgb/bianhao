import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { HomePage } from "./HomePage";
import "../styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <HomePage />
    </MotionConfig>
  </StrictMode>,
);
