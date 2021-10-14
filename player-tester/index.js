import "player-inspector/automocks";
import startListening from "player-inspector/listener";
import RxPlayer from "rx-player";
import dashjs from "dashjs";

const DASH_CONTENT_URL = "http://localhost:5001/videos/BigBuckBunny/2sec/BigBuckBunny_2s_simple_2014_05_09.mpd";

window.addEventListener("DOMContentLoaded", async () => {
  const videoElement = document.querySelector("video");
  const resultDashJs = await testDashJs(videoElement);
  console.warn("RESULT DashJs:", resultDashJs);
  const resultRxPlayer = await testRxPlayer(videoElement);
  console.warn("RESULT RxPlayer:", resultRxPlayer);
});

function listen(videoElement) {
  // Get playback metrics until either the end is reached or the timeout is
  // reached, whichever comes first
  return startListening({
    mediaElement: videoElement,
    finishAtEnd: true,
    timeout: 10000,
  });
}

async function testRxPlayer(videoElement) {
  const player = new RxPlayer({ videoElement });
  const handle = listen(videoElement);
  player.loadVideo({ url: DASH_CONTENT_URL, transport: "dash", autoPlay: true });
  const res = await handle.task;
  player.dispose();
  return res;
}

async function testDashJs(videoElement) {
  const player = dashjs.MediaPlayer().create();
  const handle = listen(videoElement);
  player.initialize(videoElement, DASH_CONTENT_URL, true);
  const res = await handle.task;
  player.destroy();
  return res;
}
