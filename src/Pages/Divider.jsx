"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { audioStop, audioPlayInd } from "../utils/audio";
import { globals } from "../data/items.json"


export default function Divider({ lesson }) {

  useEffect(()=> {
    document.title =  `علوم | ${lesson.title}`;
    audioStop();
  },[]);

  return(
    <div className="w-dvw h-dvh">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 1, delay: 0.1 }}
        className="absolute w-[calc(100%-1rem)] h-[calc(100%-1rem)] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 overflow-x-hidden rounded-2xl z-10  overflow-y-auto"
      >
        <div
          className="w-full h-full min-h-max flex justify-center items-center relative overflow-hidden"
        >
          <img
            className="object-cover absolute size-full inset-0 blur-xs brightness-75 select-none"
            src={`/assets/lessons/${lesson.id}/images/main.webp`}
          />
          <div
            className="flex flex-col gap-3 justify-center items-start py-4"
          >
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 * 2 + 0.2 }}
              src={`/assets/lessons/${lesson.id}/images/divider/logo.png`}
              className="md:w-70 w-60 h-30 object-cover aspect-auto z-2 relative left-8"
            />
            <IconButton index={2} type={"1"} lesson={lesson} back={`/assets/lessons/${lesson.id}/images/divider/clicking.jpg`} imageSrc={globals.images.volume}/>
            <IconButton index={3} type={"2"} lesson={lesson} back={`/assets/lessons/${lesson.id}/images/divider/drag-and-drop.jpg`} imageSrc={globals.images.gameController}/>
            {
              lesson.video
              ? <IconButton index={4} type={"3"} lesson={lesson} back={`/assets/lessons/${lesson.id}/images/divider/video.jpg`} imageSrc={globals.images.video}/>
              : null
            }
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function IconButton({back, imageSrc, index, type, lesson}) {
  const navigate = useNavigate();
  
  const [onClick, setOnClick] = useState(false)

  return(
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 1, delay: 0.2 * index }}
      className={cn(
        "relative md:w-75 w-60 md:h-18 h-25 border-2 rounded-3xl transition-all duration-300 ease-out hover:brightness-75 bg-amber-500 cursor-pointer overflow-hidden drop-shadow-[0_6px_0_rgba(0,0,0,0.1)]",
        onClick && "scale-95"
      )}
      onClick={() => {
        navigate(`/lessons/${lesson.id}/${type}`);
        audioPlayInd(globals.sounds.tap);
      }}
      onMouseDown={() => setOnClick(true)}
      onMouseUp={() => setOnClick(false)}
      onMouseLeave={() => setOnClick(false)}
      style={{
        background: `url(${back})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full backdrop-brightness-90 rounded-3xl z-3"
      />
      <div
        className="absolute top-0 left-0 bg-gradient-to-r from-neutral-800/80 to-neutral-800/0 h-full w-[80%] z-4"
      />
      <img
        src={imageSrc}
        className={cn(
          "w-16 h-16 absolute left-2 top-[50%] -translate-y-1/2  hue-rotate-180 scale-90 z-5",
          index % 2 === 0 ? "rotate-4" : "-rotate-4"
        )}
      />
    </motion.button>
  )
}