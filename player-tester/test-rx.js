import RxPlayer from "rx-player";
import { getBandwidth } from "./network";
import { cheatVideoData, dumpData, isVideoBitrateConstant, isVideoBitrateConstantSince, registerEvent } from "./chart-config";

const computeBufferSize = (videoElement) => {
  const { buffered, currentTime } = videoElement;
  if (buffered.length == 0) {
    return 0;
  } else {
    
    for (let i = buffered.length ; i > 0; i--) {
      if (currentTime >= buffered.start(i-1) && currentTime < buffered.end(i-1)) {
        return buffered.end(i-1) - currentTime;
      }
    }
    return 0;
  }
};

export const testRxplayer = (videoElement, mpdUrl) => {
  const startTime = performance.now();
  const player = new RxPlayer({
    videoElement,
  });
  player.loadVideo({
    url: mpdUrl,
    transport: "dash",
    autoPlay: true,
  });
  player.addEventListener("audioBitrateChange", (bitrate) => {
    registerEvent.audioBitrate(bitrate, startTime);
  });

  player.addEventListener("videoBitrateChange", (bitrate) => {
    registerEvent.videoBitrate(bitrate, startTime);
  });

  setInterval(async () => {
    if (player.getPlayerState() === "PLAYING") {
      await getBandwidth(startTime);
      if (isVideoBitrateConstantSince(startTime, 5)){
          cheatVideoData(startTime)
      }
    }
  }, 1000);

  setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    registerEvent.bufferSize(bufferSize, startTime);
  }, 100);
  

  player.addEventListener("playerStateChange", async (state) => {
    if (state === "LOADED") {
      await getBandwidth(startTime);
      videoElement.onclick = function () {
        if (player.getPlayerState() === "PLAYING") {
          player.pause();
        } else {
          player.play();
        }
      };
    }
  });
  window.player = player;
};
