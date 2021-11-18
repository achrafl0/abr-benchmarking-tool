import initializeChart, {resetChartProps} from "./chart";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs_simple_load_video_dash";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx_player_simple_load_video_dash";
import ShakaSimpleLoadVideoDash from "./scenarios/shaka_simple_load_video_dash";

const videoElement = document.getElementById("video");
const LOCAL_MPD_URL =
  "http://localhost:5001/proxy/https://cmafref.akamaized.net/cmaf/live-ull/2006350/akambr/out.mpd";

// const PROXY_MPD_URL = "http://localhost:5001/proxy/dash/tears_of_steel/cleartext/stream.mpd"

async function run() {
  initializeChart();
  // await RxPlayerSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  // await DashJsSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  await ShakaSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  await RxPlayerSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  resetChartProps();
  await DashJsSimpleLoadVideoDash(videoElement, LOCAL_MPD_URL);
  stopUpdatingChart();
}

run();
