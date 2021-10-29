import initializeChart from "./chart";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs_simple_load_video_dash";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx_player_simple_load_video_dash";

const videoElement = document.getElementsByTagName("video")[0];
const LOCAL_MPD_URL =
  "http://localhost:5001/videos/BigBuckBunny/2sec/BigBuckBunny_2s_simple_2014_05_09.mpd";

// const PROXY_MPD_URL = "http://localhost:5001/proxy/dash/tears_of_steel/cleartext/stream.mpd"

async function run() {
  initializeChart();
  await RxPlayerSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  await DashJsSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
}

run();
