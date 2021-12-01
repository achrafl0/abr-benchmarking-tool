import RxPlayer from "rx-player/minimal";
import { DASH } from "rx-player/features";
import bindToRxPlayer from "../../binders/rx-player";
// import { updateToxics } from "../utils";

RxPlayer.addFeatures([DASH]);
/**
 * Scenario to launch a low-latency DASH content with autoPlay until a timeout,
 * its end (or an error) through the RxPlayer.
 *
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {Object} metricsStore
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @param {number} timeout - Timeout after which the test will end, in
 * milliseconds.
 * @returns {Promise} - Resolves once either the content ended or stopped on
 * error.
 */
export default function RxPlayerSimpleLoadVideoDash(
  mediaElement,
  metricsStore,
  mpdUrl,
  timeout
) {
  return new Promise(async (res) => {
    let hasEnded = false;

    // await updateToxics({ rate: 1000 }, { jitter: 50, latency: 50 });
    const player = new RxPlayer({ videoElement: mediaElement });
    window.player = player;
    const unbind = bindToRxPlayer(player, mediaElement, metricsStore);
    player.loadVideo({
      url: mpdUrl,
      transport: "dash",
      autoPlay: true,
      lowLatencyMode: true,
    });
    const timeoutId = setTimeout(finish, timeout);
    player.addEventListener("playerStateChange", (state) => {
      if (state === "STOPPED" || state === "ENDED") {
        finish();
      }
    });

    function finish() {
      if (hasEnded) {
        return;
      }
      hasEnded = true;
      clearTimeout(timeoutId);
      unbind();
      player.dispose();
      delete window.player;
      res();
    }
  });
}
