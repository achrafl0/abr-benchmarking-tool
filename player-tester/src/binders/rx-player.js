import { getBandwidth } from "../network";
import { registerEvent } from "../chart";
import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to RxPlayer events
 * @param {Object} player - The RxPlayer instance
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content plays.
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToRxPlayer(
  player,
  videoElement
) {
  player.addEventListener("audioBitrateChange", onAudioBitrateChange);
  player.addEventListener("videoBitrateChange", onVideoBitrateChange);
  player.addEventListener("playerStateChange", onPlayerStateChange);

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    registerEvent.bufferSize(bufferSize);
  }, 100);

  function onAudioBitrateChange(bitrate) {
    registerEvent.audioBitrate(bitrate);
  }

  function onVideoBitrateChange(bitrate) {
    registerEvent.videoBitrate(bitrate);
  }
  
  async function onPlayerStateChange(state) {
    if (state === "LOADED") {
      await getBandwidth();
      videoElement.onclick = function () {
        if (player.getPlayerState() === "PLAYING") {
          player.pause();
        } else {
          player.play();
        }
      };
    } else if (state === "LOADING" || state === "STOPPED") {
      videoElement.onclick = undefined;
    }
  }

  return () => {
    clearInterval(bandwidthItv);
    clearInterval(bufferSizeItv);
    player.removeEventListener("playerStateChange", onPlayerStateChange);
    player.removeEventListener("audioBitrateChange", onAudioBitrateChange);
    player.removeEventListener("videoBitrateChange", onVideoBitrateChange);
  };
};
