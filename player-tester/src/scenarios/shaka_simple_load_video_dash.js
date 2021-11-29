import shaka from "shaka-player";
import bindToShaka from "../binders/shaka";
// import { updateToxics } from "../utils";

/**
 * Scenario to launch a simple DASH content with autoPlay until its end (or an
 * error) through DASH.js.
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {Object} eventEmitters
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @returns {Promise}
 */
export default function ShakaSimpleLoadVideoDash(
  mediaElement,
  eventEmitters,
  mpdUrl
) {
  return new Promise(async (res) => {
    let hasEnded = false;

    //await updateToxics({ rate: 1000 }, { jitter: 50, latency: 50 });
    shaka.polyfill.installAll();
    const player = new shaka.Player(mediaElement);
    player.configure({
      streaming: {
        lowLatencyMode: true,
      },
    });
    window.player = player;
    const unbind = bindToShaka(player, mediaElement, eventEmitters);

    player
      .load(mpdUrl)
      .then(() => {
        mediaElement.play();
      })
      .catch((err) => {
        console.error(err);
      });

    const timeout = setTimeout(finish, 5_000);

    function finish() {
      if (hasEnded) {
        return;
      }
      hasEnded = true;
      clearTimeout(timeout);
      player.destroy();
      delete window.player;
      unbind();
      res();
    }
  });
}
