"use client";

import { Navigate, Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Clicking from "./Pages/Clicking";
import DragAndDrop from "./Pages/DragAndDrop";
import Divider from "./Pages/Divider";
import { lessons } from "./data/items.json";
import VideoPlayer from "./Pages/VideoPlayer";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/lessons/1"/>}/>
        {
          lessons.map(lesson => 
            <>
              <Route path={`/lessons/${lesson.id}`} element={<PageWrapper><Divider lesson={lesson}/></PageWrapper>}/>
              <Route path={`/lessons/${lesson.id}/1`} element={<PageWrapper><Clicking lesson={lesson}/></PageWrapper>}/>
              <Route path={`/lessons/${lesson.id}/2`} element={<PageWrapper><DragAndDrop lesson={lesson}/></PageWrapper>} />
              <Route path={`/lessons/${lesson.id}/3`} element={<PageWrapper><VideoPlayer lesson={lesson}/></PageWrapper>} />
            </>
          )
        }
        <Route path="*" element={<p>404</p>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return(
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
      animate={{ opacity: 1, filter: "blur(0)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  return(
    <div className="overflow-hidden">
      <BrowserRouter>
        <AnimatedRoutes/>
      </BrowserRouter>
    </div>
  )
}