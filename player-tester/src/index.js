import ChartManager from "./chart";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs_simple_load_video_dash";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx_player_simple_load_video_dash";
import ShakaSimpleLoadVideoDash from "./scenarios/shaka_simple_load_video_dash";
import { LOCAL_MPD_URL } from "./consts";

const videoElement = document.getElementById("video");

async function run() {
  const chart1 = new ChartManager();
  const eventEmitters1 = chart1.getEventEmitters();
  document.getElementById("chart-container").appendChild(chart1.canvas);
  document.getElementById("player").textContent = "Player used: Shaka Player";
  await ShakaSimpleLoadVideoDash(videoElement, eventEmitters1, LOCAL_MPD_URL);
  chart1.stopUpdating();
  chart1.export();

  const chart2 = new ChartManager();
  const eventEmitters2 = chart2.getEventEmitters();
  document.getElementById("chart-container").appendChild(chart2.canvas);
  document.getElementById("player").textContent = "Player used: RxPlayer";
  await RxPlayerSimpleLoadVideoDash(videoElement, eventEmitters2, LOCAL_MPD_URL);
  chart2.stopUpdating();
  chart2.export();

  const chart3 = new ChartManager();
  const eventEmitters3 = chart3.getEventEmitters();
  document.getElementById("chart-container").appendChild(chart3.canvas);
  document.getElementById("player").textContent = "Player used: DashJS L2ALL";
  await DashJsSimpleLoadVideoDash(videoElement, eventEmitters3, LOCAL_MPD_URL);
  chart3.stopUpdating();
  chart3.export();
}

run();
