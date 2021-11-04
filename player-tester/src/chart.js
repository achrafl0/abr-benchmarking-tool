import { Chart, registerables } from "chart.js";

/** Chart.js's chart once it has been initialized. */
let chart = null;

/** Interval at which the Chart is refreshed. */
const CHART_UPDATING_INTERVAL = 1000;

/** If `true`, the Chart is currently updating at regular interval. */
let chartIsUpdating = false;

/** Contains the chart updates interval id, allowing to clear it to stop it. */
let chartUpdatingIntervalId;

/**
 * The starting time reference, in terms of `performance.now` which will
 * constitute the time origin of every measure.
 */
let timeRef = 0;

const audioSet = {
  label: "Audio Bitrate",
  yAxisID: "audioYAxis",
  borderColor: "#ffbaa2",
  backgroundColor: "white",
  data: [],
  stepped: "after",
  fill: false,
};
const videoSet = {
  label: "Video Bitrate",
  borderColor: "#91cf96",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: false,
  yAxisID: "videoYAxis",
};
const bandwidthSet = {
  label: "Bandwidth (kb/s)",
  borderColor: "#c881d2",
  backgroundColor: "white",
  data: [],
  stepped: "after",
  fill: false,
  yAxisID: "bandwidthYAxis",
};
const latencySet = {
  label: "Latency (ms)",
  borderColor: "#29b6f6",
  backgroundColor: "white",
  data: [],
  stepped: "after",
  fill: false,
  yAxisID: "latencyYAxis",
};
const bufferSizeSet = {
  label: "Buffer size (s)",
  borderColor: "#4DFF00",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: true,
  yAxisID: "bufferSizeYAxis",
};
const currentTimeSet = {
  label: "currentTime (s)",
  borderColor: "#FF4466",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: true,
  yAxisID: "currentTimeYAxis",
};
const playbackRateSet = {
  label: "playbackRate",
  borderColor: "#1155FF",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: true,
  yAxisID: "playbackRateYAxis",
};

const config = {
  type: "line",
  data: {
    datasets: [
      videoSet,
      audioSet,
      bandwidthSet,
      latencySet,
      bufferSizeSet,
      currentTimeSet,
      playbackRateSet,
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    scales: {
      audioYAxis: {
        title: { text: "Audio bitrate", display: true },
        type: "linear",
        position: "left",
        min: -1,
        max: 1000,
        ticks: {
          color: "#ffbaa2",
          callback: function (value, _index, _values) {
            return value + " kbit/s";
          },
        },
      },
      videoYAxis: {
        title: { text: "Video bitrate", display: true },
        type: "linear",
        position: "left",
        min: -1,
        max: 4500000,
        ticks: {
          color: "#91cf96",
          callback: function (value, _index, _values) {
            return value + " kbit/s";
          },
        },
      },
      bandwidthYAxis: {
        title: { text: "Bandwidth ", display: true },
        type: "linear",
        position: "right",
        min: 500,
        max: 25000,
        ticks: {
          color: "#c881d2",
          callback: function (value, _index, _values) {
            return value + " kbit/s";
          },
        },
      },
      latencyYAxis: {
        title: {
          display: true,
          text: "Latency",
        },
        type: "linear",
        position: "right",
        min: 0,
        max: 1500,
        ticks: {
          color: (_x) => "#29b6f6",
          callback: function (value, _index, _values) {
            return value + " ms";
          },
        },
        scaleLabel: {
          display: false,
        },
      },
      bufferSizeYAxis: {
        title: {
          display: true,
          text: "Buffer Size",
        },
        type: "linear",
        position: "left",
        min: 0,
        max: 50,
        ticks: {
          color: (_x) => "#4DFF00",
          callback: function (value, _index, _values) {
            return value + " s";
          },
        },
      },
      currentTimeYAxis: {
        title: {
          display: true,
          text: "Current Time",
        },
        type: "linear",
        position: "left",
        min: 0,
        max: 50,
        ticks: {
          color: (_x) => "#FF4466",
          callback: function (value, _index, _values) {
            return value + " s";
          },
        },
      },
      playbackRateYAxis: {
        title: {
          display: true,
          text: "Playback rate",
        },
        type: "linear",
        position: "left",
        min: 0,
        max: 10,
        ticks: {
          color: (_x) => "#1155FF",
          callback: function (value, _index, _values) {
            return value + " s";
          },
        },
      },
      xAxis: {
        title: {
          display: true,
          text: "Time",
        },
        type: "linear",
        min: 0,
        ticks: {
          color: (_x) => "black",
          callback: function (value, _index, _values) {
            return value + " s";
          },
        },
      },
    },
    elements: {
      line: {
        tension: 10, // disables bezier curves
      },
      point: {
        radius: 1,
        borderWidth: 2,
        pointStyle: "circle",
      },
    },
  },
};

export default function initializeChart() {
  Chart.register(...registerables);
  chart = new Chart(document.getElementById("chart"), config);
  timeRef = performance.now();
}

export const registerEvent = {
  audioBitrate: (bit) => {
    internalRegisterData(bit, 1);
  },
  videoBitrate: (bit) => {
    internalRegisterData(bit, 0);
  },
  latency: (latency) => {
    internalRegisterData(latency, 3);
  },
  bandwidth: (bandwidth) => {
    internalRegisterData(bandwidth, 2);
  },
  bufferSize: (buffersize) => {
    internalRegisterData(buffersize, 4);
  },
  currentTime: (currentTime) => {
    internalRegisterData(currentTime + 1, 5);
  },
  playbackRate: (rate) => {
    internalRegisterData(rate, 6);
  },
};

/**
 * Register new data in the chart.
 * @param {number} data - the data point itself
 * @param {number} index - index identifying the type of data.
 */
function internalRegisterData(data, index) {
  if (chart === null) {
    throw new Error("Chart not initialized");
  }
  const deltaTime = (performance.now() - timeRef) / 1000;

  chart.data.datasets[index].data = [
    ...chart.data.datasets[index].data,
    { y: data, x: deltaTime },
  ];
  if (!chartIsUpdating) {
    startUpdatingChart(timeRef);
  }
}

function startUpdatingChart() {
  if (chartIsUpdating) {
    stopUpdatingChart();
  }
  chart.update();
  chartUpdatingIntervalId = setInterval(() => {
    if (isVideoBitrateConstant()) {
      repeatLastVideoBitrateEvent();
    }
    chart.update();
  }, CHART_UPDATING_INTERVAL);
  chartIsUpdating = true;
}

function stopUpdatingChart() {
  clearTimeout(chartUpdatingIntervalId);
  chartIsUpdating = false;
}

function isVideoBitrateConstant() {
  if (chart.data.datasets.length === 0) {
    return false;
  }
  const videoData = chart.data.datasets[0].data;
  if (videoData.length === 0) {
    return false;
  }
  const lastBitrateTime = videoData[videoData.length - 1].x;
  return (
    (performance.now() - timeRef) / 1000 - CHART_UPDATING_INTERVAL / 1000 >
    lastBitrateTime
  );
}

function repeatLastVideoBitrateEvent() {
  if (chart === null) {
    return;
  }
  const videoData = chart.data.datasets[0].data;
  const lastBitrate = videoData[videoData.length - 1].y;
  registerEvent.videoBitrate(lastBitrate);
}
