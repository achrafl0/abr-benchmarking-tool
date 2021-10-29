import dashjs from "dashjs";
import bindToDashjs from "../binders/dashjs";
import { updateToxics } from "../utils";

/**
 * Scenario to launch a simple DASH content with autoPlay until its end (or an
 * error) through DASH.js.
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @returns {Promise}
 */
export default function DashJsSimpleLoadVideoDash(mediaElement, mpdUrl) {
  // TODO ending condition
  return new Promise(async (res) => {
    let hasEnded = false;

    await updateToxics({ rate: 1000 }, { jitter: 50, latency: 50 });
    const player = dashjs.MediaPlayer().create();
    window.player = player;
    const unbind = bindToDashjs(player, mediaElement);
    player.initialize(mediaElement, mpdUrl, true);

    const timeout = setTimeout(finish, 20000);
    player.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, finish);

    function finish() {
      if (hasEnded) {
        return;
      }
      hasEnded = true;
      clearTimeout(timeout);
      player.off(dashjs.MediaPlayer.events.PLAYBACK_ENDED, finish);
      player.destroy();
      delete window.player;
      unbind();
      res();
    }
  });
}
