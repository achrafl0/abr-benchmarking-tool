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
  fill: false,
  yAxisID: "bufferSizeYAxis",
};

const currentTimeSet = {
  label: "Time evolution",
  borderColor: "#FF4466",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: false,
  yAxisID: "currentTimeYAxis",
};

const playbackRateSet = {
  label: "playbackRate",
  borderColor: "#1155FF",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: false,
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
        min: 0,
        max: 1000,
        ticks: {
          color: "#ffbaa2",
          callback: function (value, _index, _values) {
            return value + " kbps";
          },
        },
      },
      videoYAxis: {
        title: { text: "Video bitrate", display: true },
        type: "linear",
        position: "left",
        min: 0,
        max: 1000,
        ticks: {
          color: "#91cf96",
          callback: function (value, _index, _values) {
            return value + " kbps";
          },
        },
      },
      bandwidthYAxis: {
        title: { text: "Bandwidth ", display: true },
        type: "linear",
        position: "right",
        min: 0,
        max: 1000,
        ticks: {
          color: "#c881d2",
          callback: function (value, _index, _values) {
            return value + " kbps";
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
        max: 4,
        ticks: {
          color: (_x) => "#FF4466",
          callback: function (value, _index, _values) {
            switch (value) {
              case 0:
                return "Reverse";
              case 1:
                return "Stopped";
              case 2:
                return "Too slow";
              case 3:
                return "Normal";
              case 4:
                return "Too fast";
            }
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
            return value;
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
        radius: 2,
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
    internalRegisterData(currentTime, 5);
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
  updateScales();
  chart.update();
  chartUpdatingIntervalId = setInterval(() => {
    updateScales();
    chart.update();
  }, CHART_UPDATING_INTERVAL);
  chartIsUpdating = true;
}

function updateScales() {
  const [
    videoDataSet,
    audioDataSet,
    bandwidthDataSet,
    latencyDataSet,
    bufferSizeDataSet,
    playbackRateDataSet
  ] = chart.data.datasets;
  const videoYData = videoDataSet.data.map(({ y }) => y);
  const audioYData = audioDataSet.data.map(({ y }) => y);
  const bandwidthYData = bandwidthDataSet.data.map(({ y }) => y);
  const latencyYData = latencyDataSet.data.map(({ y }) => y);
  const bufferSizeYData = bufferSizeDataSet.data.map(({ y }) => y);
  const playbackRateYData = playbackRateDataSet.data.map(({ y }) => y);
  chart.options.scales.videoYAxis.max = Math.ceil(Math.max(...videoYData, 0) + 5000);
  chart.options.scales.audioYAxis.max = Math.ceil(Math.max(...audioYData, 0) + 5000);
  chart.options.scales.bandwidthYAxis.max = Math.ceil(Math.max(...bandwidthYData, 0) + 5000);
  chart.options.scales.latencyYAxis.max = Math.ceil(Math.max(...latencyYData, 0) + 1000);
  chart.options.scales.bufferSizeYAxis.max = Math.ceil(Math.max(...bufferSizeYData, 0) + 5);
  chart.options.scales.playbackRateYAxis.max = Math.ceil(Math.max(...playbackRateYData, 0) + 1);
}

export function resetChartProps() {
  registerEvent.audioBitrate(0);
  registerEvent.videoBitrate(0);
  registerEvent.bufferSize(0);
  registerEvent.currentTime(1);
  registerEvent.playbackRate(0);
};

export function stopUpdatingChart() {
  clearTimeout(chartUpdatingIntervalId);
  chartIsUpdating = false;
}
