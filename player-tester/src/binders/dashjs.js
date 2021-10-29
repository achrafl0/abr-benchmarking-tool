import dashjs from "dashjs";
import { getBandwidth } from "../network";
import { registerEvent } from "../chart";
import { computeBufferSize } from "../utils";

/**
 * Bind the player-tester to DASH.js events
 * @param {Object} player - The DASH.js instance
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content plays.
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToDashjs(
  player,
  mediaElement
) {
  player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (a) => {
      console.log(a)
      console.log(player.getQualityFor('video'))
  });

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(mediaElement);
    registerEvent.bufferSize(bufferSize);
  }, 100);

  return () => {
    clearInterval(bufferSizeItv);
    clearInterval(bandwidthItv);
    player.off(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED);
  };
};

