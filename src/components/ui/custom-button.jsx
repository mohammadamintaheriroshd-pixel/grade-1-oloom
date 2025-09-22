import { useState } from "react";
import { cn } from "../../lib/utils";
import { useAudio } from "../../utils/audio";
import { globals } from "../../data/items.json"

const VARIENTS = {
  green: {
    bg: "bg-green-500",
    bgDark: "bg-green-700",
    border: "border-green-700",
  },
  gray: {
    bg: "bg-gray-500",
    bgDark: "bg-gray-700",
    border: "border-gray-700",
  },
  blue: {
    bg: "bg-blue-500",
    bgDark: "bg-blue-700",
    border: "border-blue-700",
  }
}

export default function CustomButton({children, varient = "green", className, onClick, indSound = true}) {
  const { audioPlayInd } = useAudio();
  
  const [clicking, setClicking] = useState(false);
  const style = VARIENTS[varient];

  return(
    <button
      onMouseDown={() => setClicking(true)}
      onMouseUp={() => setClicking(false)}
      onMouseLeave={() => setClicking(false)}
      onClick={() => {
        if (indSound) audioPlayInd(globals.sounds.tap)
        onClick()
      }}
      className={cn("relative cursor-pointer", className)}
    >
      <div className={cn(
        "relative p-4 w-full top-0 text-2xl text-white border-[2px] rounded-3xl flex items-center justify-center text-center transition-all duration-200 ease-[cubic-bezier(0,.5,.24,1.12)] hover:brightness-105",
        style.bg,
        style.border,
        clicking && "top-3 !brightness-95"
      )}>
        {children}
      </div>
      <div
        className={cn(
          "absolute -bottom-3 brightness-75 w-full h-16 border-[2px] rounded-3xl -z-1 transition-all duration-200 ease-[cubic-bezier(0,.5,.24,1.12)] drop-shadow-[0_6px_0_rgba(0,0,0,0.1)]",
          style.bgDark,
          style.border,
          clicking && "drop-shadow-[0_0px_0_rgba(0,0,0,0.1)]"
        )}
      />
    </button>
  );
}