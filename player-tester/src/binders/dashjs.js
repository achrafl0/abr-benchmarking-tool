import dashjs from "dashjs";
import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to DASH.js events
 * @param {Object} player - The DASH.js instance
 * @param {HTMLMediaElement} videoElement - The media element on which the
 * content plays.
 * @param {Object} metricsStore
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToDashjs(player, videoElement, metricsStore) {
  let lastVideoBitrate;
  player.on(
    dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
    onVideoBitrateChange
  );

  updatePlaybackRate();
  videoElement.addEventListener("ratechange", updatePlaybackRate);

  updateBufferSize();
  const bufferSizeItv = setInterval(updateBufferSize, 100);

  function updateBufferSize() {
    const bufferSize = computeBufferSize(videoElement);
    metricsStore.registerEvent("bufferSize", bufferSize);
  }

  function onVideoBitrateChange({ newQuality }) {
    const bitrate = player.getBitrateInfoListFor("video")[newQuality].bitrate;
    lastVideoBitrate = bitrate;
    metricsStore.registerEvent("videoBitrate", bitrate);
  }

  function updatePlaybackRate() {
    metricsStore.registerEvent("playbackRate", videoElement.playbackRate);
  }

  return () => {
    // send for the last time exceptional events (to have a continuous chart)
    if (lastVideoBitrate !== undefined) {
      metricsStore.registerEvent("videoBitrate", lastVideoBitrate);
    }
    updatePlaybackRate();

    // unbind event listeners
    clearInterval(bufferSizeItv);
    player.off(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED);
    videoElement.removeEventListener("ratechange", updatePlaybackRate);
  };
}
