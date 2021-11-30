import ChartManager from "./chart";
import { CDN_SERVER_URL } from "./consts";
import MetricsStore from "./metrics_store";
import DashJsSimpleLoadVideoDash from "./scenarios/dashjs/low_latency";
import RxPlayerSimpleLoadVideoDash from "./scenarios/rx-player/low_latency";
import ShakaSimpleLoadVideoDash from "./scenarios/shaka/low_latency";
import { resetToxics, updateToxics } from "./utils";

const LOW_LATENCY_MPD_URL =
  "http://localhost:5001/proxy/https://cmafref.akamaized.net/cmaf/live-ull/2006350/akambr/out.mpd";

const videoElement = document.getElementById("video");

async function run() {
  await resetToxics();
  const date = new Date().toISOString();
  const tests = [
    ["Low Latency - RxPlayer", RxPlayerSimpleLoadVideoDash],
    ["Low Latency - ShakaPlayer", ShakaSimpleLoadVideoDash],
    ["Low Latency - Dashjs", DashJsSimpleLoadVideoDash],
  ];

  const chartContainerElt = document.getElementById("chart-container");
  const currentTestNameElt = document.getElementById("test-name");

  await updateToxics({ rate: 1000 }, null);

  for (const test of tests) {
    const [testName, playerFn] = test;
    const metricsStore = new MetricsStore();
    const chart = new ChartManager(metricsStore, true);

    const h3ChartElt = document.createElement("h3");
    h3ChartElt.innerText = testName;
    chartContainerElt.appendChild(h3ChartElt);
    chartContainerElt.appendChild(chart.canvas);
    currentTestNameElt.innerText = testName;
    await playerFn(videoElement, metricsStore, LOW_LATENCY_MPD_URL, 60_000);

    chart.stopUpdating();
    const chartData = metricsStore.exportData();
    const reportBody = {
      name: testName + ".json",
      directory: date,
      data: chartData,
    };
    fetch(CDN_SERVER_URL+ "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reportBody),
    });
  }
  await resetToxics();
}

run();
