let currentAudio = null
const steps = 30;

export async function audioStop() {
  try {
    if (currentAudio) currentAudio.pause();
  } catch (err) {
    console.error(err);
  }
}

export async function audioPlay(src, volume = 1) {
  try {
      if (currentAudio) currentAudio.pause();

      const audio = new Audio();
      audio.src = src;
      audio.preload = "auto";
      audio.volume = volume;
      
      await audio.play();

      currentAudio = audio;

  } catch (err) {
    console.error(err);
  }
}

export async function audioPlayInd(src) {
  try {
    const audio = new Audio();
    audio.src = src;
    audio.preload = "auto";

    await audio.play();
  } catch (err) {
    console.error(err);
  }
}