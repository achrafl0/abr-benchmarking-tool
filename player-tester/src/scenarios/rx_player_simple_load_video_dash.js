import RxPlayer from "rx-player";
import bindToRxPlayer from "../binders/rx-player";
// import { updateToxics } from "../utils";

/**
 * Scenario to launch a simple DASH content with autoPlay until its end (or an
 * error) through the RxPlayer.
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @returns {Promise} - Resolves once either the content ended or stopped on
 * error.
 */
export default function RxPlayerSimpleLoadVideoDash(mediaElement, mpdUrl) {
  return new Promise(async (res) => {
    let hasEnded = false;

    // await updateToxics({ rate: 1000 }, { jitter: 50, latency: 50 });
    document.getElementById("player").textContent = "Player used: RxPlayer";
    const player = new RxPlayer({ videoElement: mediaElement });
    window.player = player;
    const unbind = bindToRxPlayer(player, mediaElement);
    player.loadVideo({
      url: mpdUrl,
      transport: "dash",
      autoPlay: true,
      lowLatencyMode: true,
    });
    player.mute();
    const timeout = setTimeout(finish, 20_000);
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
      clearTimeout(timeout);
      player.dispose();
      delete window.player;
      unbind();
      res();
    }
  });
}
