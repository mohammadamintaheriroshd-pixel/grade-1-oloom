"use client";

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { SquareArrowUpLeftIcon } from "lucide-react"
import CustomButton from "../components/ui/custom-button"
import { audioStop } from "../utils/audio"

export default function VideoPlayer({ lesson }) {
  const navigate = useNavigate();
  
  useEffect(()=> {
    document.title =  `علوم | ${lesson.title}`;
    audioStop();
    if (lesson.video === "") navigate(`/lessons/${lesson.id}`)
  },[]);

  return(
    <div className="w-dvw h-dvh">
      <motion.div
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 1, delay: 0.6 }}
        className="z-105 absolute top-2 left-2"
      >
        <CustomButton className="w-20" varient="gray" onClick={() => navigate(`/lessons/${lesson.id}`)}>
          <SquareArrowUpLeftIcon size={40}/>
        </CustomButton>
      </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1, delay: 0.1 }}
          className="w-full h-full flex justify-center items-center"
        >
          <iframe 
            className="rounded-2xl shadow-lg  transition-all duration-300 ease-out h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
            src={lesson.video}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
        </motion.div>
    </div>
  )
}