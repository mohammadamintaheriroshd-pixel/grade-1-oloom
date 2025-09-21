let currentAudio = null

export async function audioStop() {
  try {
    if (!currentAudio) return;

    const audio = currentAudio;
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

export async function audioPlay(src, volume = 1) {
  try {
      audioStop();

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