import initializeChart from "./chart";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs_simple_load_video_dash";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx_player_simple_load_video_dash";

const videoElement = document.getElementById("video");
const videoElement2 = document.getElementById("video1");
const LOCAL_MPD_URL =
  "http://localhost:5001/proxy/https://cmafref.akamaized.net/cmaf/live-ull/2006350/akambr/out.mpd";

// const PROXY_MPD_URL = "http://localhost:5001/proxy/dash/tears_of_steel/cleartext/stream.mpd"

async function run() {
  initializeChart();
  await RxPlayerSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  await DashJsSimpleLoadVideoDash(videoElement2, LOCAL_MPD_URL);
}

run();
