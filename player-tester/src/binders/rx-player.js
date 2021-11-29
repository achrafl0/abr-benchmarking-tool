import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to RxPlayer events
 * @param {Object} player - The RxPlayer instance
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content plays.
 * @param {Object} metricsStore
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToRxPlayer(player, videoElement, metricsStore) {
  player.addEventListener("audioBitrateChange", onAudioBitrateChange);
  player.addEventListener("videoBitrateChange", onVideoBitrateChange);
  let lastAudioBitrate;
  let lastVideoBitrate;

  updatePlaybackRate();
  videoElement.addEventListener("ratechange", updatePlaybackRate);

  updateBufferSize();
  const bufferSizeItv = setInterval(updateBufferSize, 100);

  function updateBufferSize() {
    const bufferSize = computeBufferSize(videoElement);
    metricsStore.registerEvent("bufferSize", bufferSize);
  }

  function updatePlaybackRate() {
    metricsStore.registerEvent("playbackRate", videoElement.playbackRate);
  }

  function onAudioBitrateChange(bitrate) {
    lastAudioBitrate = bitrate;
    metricsStore.registerEvent("audioBitrate", bitrate);
  }

  function onVideoBitrateChange(bitrate) {
    lastVideoBitrate = bitrate;
    metricsStore.registerEvent("videoBitrate", bitrate);
  }

  return () => {
    // send for the last time exceptional events (to have a continuous chart)
    if (lastAudioBitrate !== undefined) {
      metricsStore.registerEvent("audioBitrate", lastAudioBitrate);
    }
    if (lastVideoBitrate !== undefined) {
      metricsStore.registerEvent("videoBitrate", lastVideoBitrate);
    }
    updatePlaybackRate();

    // unbind event listeners
    clearInterval(bufferSizeItv);
    videoElement.removeEventListener("ratechange", updatePlaybackRate);
    player.removeEventListener("audioBitrateChange", onAudioBitrateChange);
    player.removeEventListener("videoBitrateChange", onVideoBitrateChange);
  };
}
