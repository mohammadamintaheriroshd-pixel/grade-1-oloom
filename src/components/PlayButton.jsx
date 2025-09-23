import { useState } from "react";
import { motion } from "motion/react";
import { PlayIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useAudio } from "../context/audio";
import Button from "../components/ui/custom-button";

export default function PlayButton({src, func}){
  const { audioPlay } = useAudio();
  const [toggle, setToggle] = useState(false);

  function clickHandle() {
    setToggle(true);
    setTimeout(() => {
      audioPlay(src)
      try { if (func) func(); } catch (err) { console.log(err) }
    }, 500)
  }

  return(
    <div className={cn(
      "absolute inset-0 w-screen h-screen flex items-center justify-center bg-white/60 z-104 transition-opacity duration-500",
      toggle ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <motion.div
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.3 }}
        >
          <Button className="w-75" onClick={clickHandle}>
            <PlayIcon size={58} fill="white"/>
          </Button>
        </motion.div>
    </div>
  );
}