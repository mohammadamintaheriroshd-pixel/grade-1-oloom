"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SquareArrowDownRightIcon, StarIcon, Volume2Icon, X } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { isMobile} from "react-device-detect";
import { DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import Lottie from "lottie-react";
import { cn } from "../lib/utils";
import CustomButton from "../components/ui/custom-button";
import PlayButton from "../components/PlayButton";
import { useAudio } from "../utils/audio";
import { pixelToPercent } from "../utils/image";
import ZoomIn from "../assets/animations/ZoomIn.json"
import confetti from "canvas-confetti";
import { globals } from "../data/items.json"

export default function DragAndDrop({ lesson }) {
  const { audioPlay, audioPlayInd, audioStop } = useAudio();
  const [loaded, setLoaded] = useState(false)

  // Stopping every audio.
  useEffect(()=> {
    document.title =  `علوم | ${lesson.title}`;
    audioStop();
  },[]);
  
  // Global hooks
  const navigate = useNavigate();

  // Image calculations.
  const [imageDims, setImageDims] = useState({width: 0, height: 0});
  const [displayedSize, setdisplayedSize] = useState({width: 0, height: 0});

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

  // Pinch, pan, zoom feature.
  const [toggle, setToggle] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Game logics.
  const [dndElements, setDndElements] = useState(lesson.elements.map((element, index) => 
    ({id: element.id, removed: false, correct: false, mistake: false, lockedPos: null, index})
  ))
  const allCorrect = dndElements.filter(e => e.removed === true).length === lesson.elements.length

  useEffect(() => {if (allCorrect) setTimeout(winning, 500)}, [allCorrect])

  const [lives, setLives] = useState(globals.lives)

  useEffect(() => {
    if (lives === -1) {
      setLives(globals.lives)
      audioPlayInd(globals.sounds.fail);
      setTimeout(() => {
        setDndElements((datas) => 
          datas.map((element) =>
            ({ ...element, removed: false, correct: false, lockedPos: null }) 
        ));
      }, 200)  
    }
  },[lives])

  function losing(active) {
    setLives((numb) => numb - 1)
    audioPlayInd(globals.sounds.wrong);

    setDndElements((datas) => datas.map((element) =>element.id === active.id ? { ...element, mistake: true }: element));

    setTimeout(() => {
      setDndElements((datas) => datas.map((element) =>element.id === active.id ? { ...element, mistake: false } : element));
    }, 500)
  }

  function winning() {
    audioPlay(globals.sounds.win, 0.3);
    const duration = 1.4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) =>
      Math.random() * (max - min) + min;
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

   // DND
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const [activeDrag, setActiveDrag] = useState(null);
  const currentElemet = dndElements.filter((e) => e.id === activeDrag)[0]

  function handleDragEnd ({ active, over, delta }) {
    if (!over || over.id === "dock") return;
    if (over.id === "screen") return losing(active);

    
    if (active.id === over.id.split("/")[0]){
      audioPlayInd(globals.sounds.correct)
      setDndElements((datas) => 
        datas.map((element) =>
          element.id === active.id
            ? { ...element, correct: true, lockedPos: {x: delta.x, y: delta.y} }
            : element
      ));
    } else losing(active);
  };

  return(
    <>
      <img
        src={`/assets/lessons/${lesson.id}/images/main.webp`}
        onLoad={onImageLoad}
        className="w-full h-full object-contain absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 hidden"
      />
      {
        loaded === true
        ? <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveDrag(active.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="relative w-dvw h-dvh overflow-hidden">
              <PlayButton src={`/assets/lessons/${lesson.id}/sounds/intro2.mp3`} func={() => setToggle(true)}/>
              <Dock allCorrect={allCorrect} dndElements={dndElements} setDndElements={setDndElements} lesson={lesson} toggle={toggle}/>
              <Lives lives={lives} allCorrect={allCorrect} toggle={toggle}/>
              <motion.div
                initial={{ scale: 0, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 1, delay: 0.6 }}
                className="z-105 absolute bottom-4 right-2"
              >
                <CustomButton className="w-20" varient="gray" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                  <SquareArrowDownRightIcon size={40}/>
                </CustomButton>
              </motion.div>
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
              <div
                className="absolute w-[calc(100%-1rem)] h-[calc(100%-1rem)] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl z-10"
              >
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
                      animate={
                        allCorrect
                        ? { filter: ["brightness(100%)","brightness(125%)","brightness(110%)","brightness(100%)"], transition: {duration: 0.7, ease: "easeOut", delay: 0.6 }}
                        : {scale: [0,1], transition: {duration: 1.5, type: "spring" }}
                      }
                    >
                    <div
                      className="w-screen h-screen relative -top-2 -right-2 cursor-grab"
                    > 
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
                            <EntireScreen/>
                            {
                              lesson.elements.map((element) => 
                                element.dimensions.map((dim, index) => {
                                  return(
                                    <DropZone element={element} dim={dim} imageDims={imageDims} allCorrect={allCorrect} index={index} key={index}/>
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
            { 
              activeDrag &&
                <DraggableButtonOverlay element={currentElemet}/>
            }
          </DndContext>
        : <div className="w-dvw h-dvh flex justify-center items-center z-50">
            <p className="font-bold text-4xl">درحال بارگذاری</p>
          </div>
      }
    </>
  );
}

function Lives({lives, allCorrect, toggle}) {
  const maxLives = globals.lives
  
  return(
    <div
      className={cn(
        "absolute -top-12 left-6 bg-white border rounded-2xl flex flex-row-reverse gap-1 p-2 z-100 overflow-hidden transition-[top] delay-375 duration-800 ease-[cubic-bezier(.13,0,0,1.25)]",
        (toggle && !allCorrect) && "top-6"
      )}
    >
      {
        Array.from({length: maxLives}).map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, y: 100 }}
            animate={
              lives === maxLives
              ? { scale: [1,1.7,1], y: 0, duration: 0.1, transition: { delay: index * 0.1 } }
              : { scale: 1, y: 0, transition: { type: "spring", duration: 1, delay: index * 0.2 + 4 }}
            }
          >
            <StarIcon
              fill={lives < index + 1 ?  "#ffffff" : "#ffdd57"}
            />
          </motion.div>
        ))
      }
    </div>
  )
}

function Dock({ allCorrect, dndElements, setDndElements, lesson, toggle }) {
  const { audioPlay } = useAudio();
  const { setNodeRef } = useDroppable({ id: "dock" });

  const [isDragging, setIsDragging] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);

  return(
    <div
      className={cn(
        "relative transition-transform duration-800 ease-[cubic-bezier(.13,0,0,1.25)] lg:translate-x-[200px] lg:translate-y-[unset] translate-y-[200px] translate-x-[unset] z-103",
        (toggle && !allCorrect) && "lg:translate-x-[0] lg:translate-y-[unset] translate-y-[0] translate-x-[unset]",
      )}
    >
      <motion.div
        ref={setNodeRef}
        onClick={() => setIsDockOpen(true)}
        onMouseEnter={() => setIsDockOpen(true)}
        onMouseLeave={() => isDragging ? setTimeout(() => {setIsDockOpen(false)}, 500) : setIsDockOpen(false)}
        className={cn(
          "fixed bg-white rounded-t-2xl lg:rounded-l-2xl lg:-right-8 right-[unset] lg:left-[unset] left-4 lg:top-4 md:top-[calc(100dvh-3rem)] top-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-7.5rem)] max-h-[unset] lg:max-w-[unset]  max-w-[calc(100dvw-7.5rem)] lg:w-36 w-max lg:h-max h-36 transition-[top,right,transform] duration-300 ease-[cubic-bezier(.13,0,0,1.25)] border-2 border-neutral-700/50 drop-shadow-3xl flex justify-end overflow-hidden p-2",
          (isDockOpen || (isDragging && !isMobile)) && "top-[calc(100dvh-6rem)] md:top-[calc(100dvh-7rem)]",
        )}
        layout
      >
        <div
          className="flex lg:flex-col flex-row gap-2 p-2 lg:max-h-[calc(100%-7.5rem)] max-h-[unset] lg:w-25 w-max lg:h-[unset] md:h-25 h-22 lg:max-w-[unset] lg:overflow-y-scroll overflow-y-hidden lg:overflow-x-hidden overflow-x-scroll scroll-container rounded-t-2xl lg:rounded-l-2xl"
          dir="ltr"
        >
          {
            dndElements.map((element, i) =>
              <DraggableButton
                key={i}
                element={element}
                onClick={() => audioPlay(`/assets/lessons/${lesson.id}/sounds/${lesson.elements[i].id}.mp3`)}
                remove={() => 
                  setDndElements((datas) => datas.map((e) => e.id === element.id ? { ...e, removed: true } : e))
                }
                setDragging={(e) => setIsDragging(e)}
              />
            )
          }
        </div>
      </motion.div>
    </div>
    
  )
}

function DraggableButton({ element, onClick, remove, setDragging }) {
  const {attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
  })
  const finalPos = element.lockedPos || { x: 0, y: 0 };

  useEffect(()=> { setDragging(isDragging) }, [isDragging])

  return(
    <>
      {
        !element.removed &&
        <motion.div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          onClick={onClick}
          animate={
            element.correct
              ? { x: finalPos.x, y: finalPos, opacity: 0, scale: 0.8 }
              : transform
              ? { x: transform.x, y: transform.y, transition: {duration: 0} }
              : { x: 0, y: 0, scale: 1 }
          }
          layout
          transition={{ type: "spring", duration: 0.25 }}
          onAnimationComplete={() => { if (element.correct) remove() }}
          className={cn(
            "relative w-15 h-15 aspect-square md:w-18 md:h-18 rounded-2xl flex justify-center items-center cursor-grab border bg-white select-none z-10 transition-[filter,background] duration-300 ease-out hover:brightness-90",
            element.mistake && "bg-red-500",
            element.correct && "bg-green-500",
          )}
        >
          <Volume2Icon size={40}/>
          <X 
            fill="#ff4340"
            className={cn(
              "absolute -bottom-2 -right-2 bg-white border rounded-full scale-0 transition-all duration-300 ease-out",
              element.mistake && "scale-100",
            )}
          size={40}/>
          <span
            className="absolute -bottom-2 -left-2 text-xl bg-white border rounded-full aspect-square w-8 h-8 flex justify-center items-center"
          >
            {element.index + 1}
          </span>
        </motion.div>
      }
    </>
  )
}

function DraggableButtonOverlay({ element }) {

  const container = useRef(null);
  const XIcon = useRef(null)

  useEffect(() => {
    if (!container.current) return;
    if (element.mistake) {
      container.current.style.cssText = "background: #ff3c2e !important";
      XIcon.current.style.cssText = "transform: scale(1) !important";
    } else {
      container.current.style.cssText = "background: white !important";
      XIcon.current.style.cssText = "transform: scale(0) !important";
    }
    if (element.correct)
        container.current.style.cssText = `
          background: #54ff2e !important;
          opacity: 0 !important;
          transform: scale(1.3);
        `
  }, [element])

  return(
    <DragOverlay
      dropAnimation={
        element.correct && { duration: 500, easing: "cubic-bezier(1,-0.01,1,-0.07)" }
      }
    >
      <div
        className={cn("relative w-15 h-15 aspect-square md:w-18 md:h-18 rounded-2xl flex justify-center items-center cursor-grab border bg-white select-none z-10 transition-[filter,background,opacity,transform] duration-300 ease-out hover:brightness-90")}
        ref={container}
      >
        <Volume2Icon size={40}/>
        <X 
          fill="#ff4340"
          className="absolute -bottom-2 -right-2 bg-white border rounded-full transition-all duration-300 ease-out"
          style={{transform: "scale(0)"}}
          ref={XIcon}
          size={40}
          />
        <span
          className="absolute -bottom-2 -left-2 text-xl bg-white border rounded-full aspect-square w-8 h-8 flex justify-center items-center"
        >
          {element.index + 1}
        </span>
      </div>
      </DragOverlay>

  )
}

function DropZone({element, dim, imageDims, allCorrect, index}) {
  const { audioPlay } = useAudio();

  const { setNodeRef } = useDroppable({
    id: `${element.id}/${index}`
  });

  const buttonDims = pixelToPercent(dim, imageDims, true)

  return(
    <div
      ref={setNodeRef}
      onClick={() => allCorrect && audioPlay(element.sound)}
      className={cn(
        "absolute z-99",
        allCorrect && "cursor-pointer"
      )}
      style={{
        left: `${buttonDims.x}%`,
        top: `${buttonDims.y}%`,
        width: `${buttonDims.width}%`,
        height: `${buttonDims.height}%`,
      }}
    />
  )
}

function EntireScreen() {
  const { setNodeRef } = useDroppable({ id: "screen" });

  return(
    <div
      ref={setNodeRef}
      className="absolute w-full h-full inset-0"
    />
  )
}