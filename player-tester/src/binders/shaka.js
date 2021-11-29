import { getBandwidth } from "../network";
import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to ShakaPlayer events
 * @param {Object} player - The ShakaPlayer instance
 * @param {HTMLMediaElement} videoElement - The media element on which the
 * content plays.
 * @param {Object} eventEmitters
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToShaka(player, videoElement, eventEmitters) {
  let currentTime = 0;
  console.warn(player);

  const currentTimeId = setInterval(onCurrentTimeChange, 1000);
  const rateChange = setInterval(onPlaybackRateChange, 1000);

  function onPlaybackRateChange() {
    eventEmitters.playbackRate(videoElement.playbackRate);
  }

  function onCurrentTimeChange() {
    if (videoElement.currentTime === currentTime) {
      eventEmitters.currentTime(0);
      return;
    }
    eventEmitters.currentTime(1);
    currentTime = videoElement.currentTime;
  }

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    eventEmitters.bufferSize(bufferSize);
  }, 100);

  return () => {
    clearInterval(currentTimeId);
    clearInterval(rateChange);
    clearInterval(bufferSizeItv);
    clearInterval(bandwidthItv);
  };
}
