import initializeChart, { exportChart, resetChartProps } from "./chart";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs_simple_load_video_dash";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx_player_simple_load_video_dash";
import ShakaSimpleLoadVideoDash from "./scenarios/shaka_simple_load_video_dash";
import { LOCAL_MPD_URL } from "./consts";

const videoElement = document.getElementById("video");
document.getElementById("export-button").onclick = exportChart

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