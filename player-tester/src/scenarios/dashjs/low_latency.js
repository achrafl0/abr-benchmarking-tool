import dashjs from "dashjs";
import bindToDashjs from "../../binders/dashjs";
// import { updateToxics } from "../utils";

/**
 * Scenario to launch a low-latency DASH content with autoPlay until a timeout,
 * its end (or an error) through DASH.js.
 *
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {Object} metricsStore - Object allowing to dispatch metrics.
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @param {number} timeout - Timeout after which the test will end, in
 * milliseconds.
 * @returns {Promise}
 */
export default function DashJsSimpleLoadVideoDash(
  mediaElement,
  metricsStore,
  mpdUrl,
  timeout
) {
  // TODO ending condition
  return new Promise(async (res) => {
    let hasEnded = false;
    const player = dashjs.MediaPlayer().create();
    window.player = player;
    const unbind = bindToDashjs(player, mediaElement, metricsStore);
    player.updateSettings({
      streaming: {
        lowLatencyEnabled: true,
        abr: {
          useDefaultABRRules: true,
          ABRStrategy: "abrL2A",
        },
      },
    });
    player.initialize(mediaElement, mpdUrl, true);

    const timeoutId = setTimeout(finish, timeout);
    player.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, finish);

    function finish() {
      if (hasEnded) {
        return;
      }
      hasEnded = true;
      clearTimeout(timeoutId);
      unbind();
      player.off(dashjs.MediaPlayer.events.PLAYBACK_ENDED, finish);
      player.destroy();
      delete window.player;
      res();
    }
  });
}

