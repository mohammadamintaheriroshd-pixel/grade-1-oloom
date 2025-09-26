import { useState, useRef, useMemo, useContext, createContext } from "react";

const AudioContext = createContext();

export function AudioContextProvider({ children }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlayBackPosition] = useState(0);
  const currentlyPlayingIdRef = useRef(null);
  const currentAudio = useRef(null);

  function audioStop() {
    try {
      setCurrentlyPlaying(null);
      setIsPlaying(false)
      setPlayBackPosition(0)
      currentlyPlayingIdRef.current = null;

      const audio = currentAudio.current;
      if (!audio) return;

      const initialVolume = audio.volume;
      const fadeSteps = 20;
      const stepTime = 200 / fadeSteps;

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

  async function audioPlay(src, loop = false, volume = 1) {
    try {
      audioStop();

      const srcName = src.split("/").pop().replace(/\.mp3$/i, "");
      setCurrentlyPlaying(srcName);

      const uniqueId = crypto.randomUUID();
      currentlyPlayingIdRef.current = uniqueId;

      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = volume;
      audio.loop = loop;

      await audio.play().finally(() => {
        setIsPlaying(true)
        const playpackPostionInterval = setInterval(() => {
          if (currentlyPlayingIdRef.current === uniqueId) setPlayBackPosition(prev => prev = prev + 1);
          else clearInterval(playpackPostionInterval);
        }, 10)
      });
      currentAudio.current = audio;

      audio.onpause = () => {
        if (currentlyPlayingIdRef.current === uniqueId) {
          setCurrentlyPlaying(null);
          setIsPlaying(false)
          currentlyPlayingIdRef.current = null;
        }
      };

      audio.onended = () => {
        if (currentlyPlayingIdRef.current === uniqueId) {
          setCurrentlyPlaying(null);
          setIsPlaying(false)
          currentlyPlayingIdRef.current = null;
        }
      };
    } catch (err) {
      console.error(err);
    }
  }

  async function audioPlayInd(src) {
    try {
      const audio = new Audio(src);
      audio.preload = "auto";
      await audio.play();
    } catch (err) {
      console.error(err);
    }
  }

  const audioValues = useMemo(
    () => ({
      currentlyPlaying,
      isPlaying,
      playbackPosition,
      audioStop,
      audioPlay,
      audioPlayInd,
    }),
    [currentlyPlaying, isPlaying, playbackPosition]
  );

  return (
    <AudioContext.Provider value={audioValues}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside AudioContextProvider.");
  return ctx;
}
