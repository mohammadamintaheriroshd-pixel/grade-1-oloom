import { useState, useRef, useMemo, useContext, createContext } from "react";

const AudioContext = createContext();

export function AudioContextProvider({ children }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const currentAudio = useRef(null);

  function audioStop() {
    try {
      if (!currentAudio.current) return;

      setCurrentlyPlaying(null)

      const audio = currentAudio.current;
      const initialVolume = audio.volume;
      const fadeSteps = 20;
      const stepTime = 1000 / fadeSteps;

      let currentStep = 0;

      const fadeOut = setInterval(() => {
        currentStep++;
        const newVolume = initialVolume * (1 - currentStep / fadeSteps);
        audio.volume = Math.max(newVolume, 0);

        if (currentStep >= fadeSteps) {
          clearInterval(fadeOut);
          audio.pause();
          audio.volume = initialVolume;
        }
      }, stepTime);
    } catch (err) {
      console.error(err);
    }
  }

  async function audioPlay(src, volume = 1) {
    try {
        audioStop();
        const srcName = src.split("/").pop().replace(/\.mp3$/i, "")
        setCurrentlyPlaying(srcName);

        const audio = new Audio();
        audio.src = src;
        audio.preload = "auto";
        audio.volume = volume;
        
        await audio.play();

        currentAudio.current = audio;

        audio.onpause = () => {
          if (currentlyPlaying === srcName) setCurrentlyPlaying(null)
        }

    } catch (err) {
      console.error(err);
    }
  }

  async function audioPlayInd(src) {
    try {
      const audio = new Audio();
      audio.src = src;
      audio.preload = "auto";

      await audio.play();
    } catch (err) {
      console.error(err);
    }
  }

  const audioValues = useMemo(
    () => ({
      currentlyPlaying, audioStop, audioPlay, audioPlayInd
    }),
    [currentlyPlaying]
  )

  return(
    <AudioContext.Provider value={audioValues}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside AudioContextProvider Provider.");
  return ctx;
}