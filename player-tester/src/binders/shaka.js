import { getBandwidth } from "../network";
import { registerEvent } from "../chart";
import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to ShakaPlayer events
 * @param {Object} player - The ShakaPlayer instance
 * @param {HTMLMediaElement} videoElement - The media element on which the
 * content plays.
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToShaka(player, videoElement) {
  let currentTime = 0;
  console.warn(player);

  const currentTimeId = setInterval(onCurrentTimeChange, 1000);
  const rateChange = setInterval(onPlaybackRateChange, 1000);

  function onPlaybackRateChange() {
    registerEvent.playbackRate(videoElement.playbackRate);
  }

  function onCurrentTimeChange() {
    if (videoElement.currentTime === currentTime) {
      registerEvent.currentTime(0);
      return;
    }
    registerEvent.currentTime(1);
    currentTime = videoElement.currentTime;
  }

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    registerEvent.bufferSize(bufferSize);
  }, 100);

  return () => {
    clearInterval(currentTimeId);
    clearInterval(rateChange);
    clearInterval(bufferSizeItv);
    clearInterval(bandwidthItv);
  };
}
