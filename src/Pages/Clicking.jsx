"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SquareArrowDownRightIcon, Volume2Icon } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { isMobile } from "react-device-detect";
import Lottie from "lottie-react";
import { cn } from "../lib/utils";
import CustomButton from "../components/ui/custom-button";
import PlayButton from "../components/PlayButton";
import { useAudio } from "../utils/audio";
import { pixelToPercent } from "../utils/image";
import ZoomIn from "../assets/animations/ZoomIn.json"

export default function Clicking({ lesson }) {
  const {currentlyPlaying, audioPlay, audioStop} = useAudio()
  const [loaded, setLoaded] = useState(false)
  
  useEffect(()=> {
    document.title =  `علوم | ${lesson.title}`;
    audioStop();
  },[]);

  const navigate = useNavigate();

  const [imageDims, setImageDims] = useState({width: 0, height: 0});
  const [displayedSize, setdisplayedSize] = useState({width: 0, height: 0});
  const [toggle, setToggle] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  function onImageLoad(e) {
    setLoaded(true);
    const { naturalWidth, naturalHeight } = e.target;
    setImageDims({
      width: naturalWidth,
      height: naturalHeight,
    });
  }

  useEffect(() => {
    if (!imageDims.width || !imageDims.height) return;

    function calculatedisplayedSize () {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const imageAspectRatio = imageDims.width / imageDims.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let displayedWidth, displayedHeight;

      if (imageAspectRatio > containerAspectRatio) {
        displayedWidth = containerWidth;
        displayedHeight = containerWidth / imageAspectRatio;
      } else {
        displayedHeight = containerHeight;
        displayedWidth = containerHeight * imageAspectRatio;
      }
      
      setdisplayedSize({width: displayedWidth, height: displayedHeight});
    }

    calculatedisplayedSize();
    window.addEventListener("resize", calculatedisplayedSize);
    return () => window.removeEventListener("resize", calculatedisplayedSize);
  }, [imageDims]);

  return(
    <>
      <img
        src={`/assets/lessons/${lesson.id}/images/main.webp`}
        onLoad={onImageLoad}
        className="w-full h-full object-contain absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 hidden"
      />
      { loaded
        ? <div className="w-dvw h-dvh overflow-hidden">
            <PlayButton src={``} func={() => setToggle(true)}/>
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 1, delay: 0.4 }}
              className="z-105 absolute bottom-4 right-2"
            >
              <CustomButton className="w-20" varient="gray" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                <SquareArrowDownRightIcon size={40}/>
              </CustomButton>
            </motion.div>
          {
            toggle &&
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 1 }}
              className="z-105 absolute bottom-4 right-24"
            >
              <CustomButton className="w-20" varient={currentlyPlaying === "mix" ? "blue" : "gray"} onClick={() => currentlyPlaying === "mix" ? audioStop() : audioPlay(`/assets/lessons/${lesson.id}/sounds/mix.mp3`)} indSound={false}>
                <Volume2Icon size={40}/>
              </CustomButton>
            </motion.div>
          }
              {
                (toggle && isMobile) &&
                <Lottie
                  animationData={ZoomIn}
                  loop={1}
                  className={cn(
                    "absolute w-80 h-80 left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-102 pointer-events-none transition-all duration-300",
                    isZoomed && "opacity-0"
                  )}
                  autoplay
                />
              }
              <div className="absolute w-[calc(100vw-1rem)] h-[calc(100vh-1rem)] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl">
                <TransformWrapper
                  initialScale={0.95}
                  minScale={0.95}
                  maxScale={5}
                  wheel={{
                    step: 0.1,
                    smoothStep: 0.005,
                  }}
                  doubleClick={{disabled: false}}
                  pinch={{step: 5}}
                  onZoom={() => setIsZoomed(true)}
                  onPinching={() => setIsZoomed(true)}
                  onPanning={() => setIsZoomed(true)}
                >
                  <TransformComponent>
                    <motion.div
                      initial={{scale: 0}}
                      animate={{scale: 1}}
                      transition={{ duration: 1.5, type: "spring", ease: "easeOut" }}
                    >
                    <div className="w-screen h-screen relative -top-2 -right-2 cursor-grab"> 
                      { 
                        displayedSize.width > 0 &&
                        <div
                          className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl scale-95"
                          style={{
                            width: `${displayedSize.width}px`,
                            height: `${displayedSize.height}px`,
                            aspectRatio: displayedSize.width / displayedSize.height
                          }}>
                            <img
                              src={`/assets/lessons/${lesson.id}/images/main.webp`}
                              className="w-full h-full object-contain absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
                            />
                            {
                              lesson.elements.map((element) => 
                                element.dimensions.map((dim, index) => {
                                  const buttonDims = pixelToPercent(dim, imageDims, false)
                                  return(
                                    <button
                                      key={index}
                                      onClick={() => audioPlay(`/assets/lessons/${lesson.id}/sounds/${element.id}.mp3`)}
                                      className="absolute cursor-pointer"
                                      style={{
                                        left: `${buttonDims.x}%`,
                                        top: `${buttonDims.y}%`,
                                        width: `${buttonDims.width}%`,
                                        height: `${buttonDims.height}%`,
                                      }}
                                    />
                                  )
                                })
                              )
                            }
                        </div>
                      }
                    </div>
                    </motion.div>
                  </TransformComponent>
                </TransformWrapper>
              </div>
          </div>
        : <div className="w-dvw h-dvh flex justify-center items-center z-50">
            <p className="font-bold text-4xl">درحال بارگذاری</p>
          </div>
      }
    </>
  );
}