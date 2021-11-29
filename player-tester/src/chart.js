import { Chart, registerables } from "chart.js";
import {CDN_SERVER_URL, CHART_UPDATING_INTERVAL} from "./consts"

// TODO comment what this is doing
Chart.register(...registerables);

export default class ChartManager {
  /** Canvas on which the chart will be displayed. */
  canvas;

  /** If true, the chart is currently regularly updating. */
  #chartIsUpdating = false;

  /** Store setInterval id for  the interval refreshing the chart. */
  #chartUpdatingIntervalId = undefined;

  /** indicate a time origin for the x axis */
  #timeRef = 0;

  /** Chart.js Chart */
  #chart;

  /** Chart.js Chart configuration */
  #config;

  /** Set to `true` once at least a single data point has been added. */
  #isInitialized = false;

  /**
   * Create a new ChartManager.
   * Once created, its associated canvas (and chart displayed in it) can be
   * retrieved through the `canvas` public property.
   */
  constructor() {
    this.canvas = document.createElement("canvas");
    this.#config = generateInitialConfig();
    this.#chart = new Chart(this.canvas, this.#config);
  }

  getEventEmitters() {
    const lazilyInitialize = this.#lazilyInitialize.bind(this);
    const internalRegisterData = this.#internalRegisterData.bind(this);
    return {
      audioBitrate: (bit) => {
        lazilyInitialize();
        internalRegisterData(bit, 1);
      },
      videoBitrate: (bit) => {
        lazilyInitialize();
        internalRegisterData(bit, 0);
      },
      latency: (latency) => {
        lazilyInitialize();
        internalRegisterData(latency, 3);
      },
      bandwidth: (bandwidth) => {
        lazilyInitialize();
        internalRegisterData(bandwidth, 2);
      },
      bufferSize: (buffersize) => {
        lazilyInitialize();
        internalRegisterData(buffersize, 4);
      },
      currentTime: (currentTime) => {
        lazilyInitialize();
        internalRegisterData(currentTime, 5);
      },
      playbackRate: (rate) => {
        lazilyInitialize();
        internalRegisterData(rate, 6);
      },
    };
  }

  startUpdatingChart() {
    if (this.#chartIsUpdating) {
      stopUpdatingChart();
    }
    this.#updateScales();
    this.#chart.update();
    this.#chartUpdatingIntervalId = setInterval(() => {
      this.#updateScales();
      this.#chart.update();
    }, CHART_UPDATING_INTERVAL);
    this.#chartIsUpdating = true;
  }

  resetProps() {
    registerEvent.audioBitrate(0);
    registerEvent.videoBitrate(0);
    registerEvent.bufferSize(0);
    registerEvent.currentTime(1);
    registerEvent.playbackRate(0);
  }

  stopUpdating() {
    clearTimeout(this.#chartUpdatingIntervalId);
    this.#chartIsUpdating = false;
  }

  export() {
    const data = { data: this.#config.data.datasets }
    return fetch(CDN_SERVER_URL+"/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
  } 

  #lazilyInitialize() {
    if (this.#isInitialized) {
      return ;
    }
    this.#timeRef = performance.now();
    this.#isInitialized = true;
  }

  /**
   * Register new data in the chart.
   * @param {number} data - the data point itself
   * @param {number} index - index identifying the type of data.
   */
  #internalRegisterData(data, index) {
    const deltaTime = (performance.now() - this.#timeRef) / 1000;
    this.#chart.data.datasets[index].data.push({ y: data, x: deltaTime });
    if (!this.#chartIsUpdating) {
      this.startUpdatingChart();
    }
  }

  #updateScales() {
    const [
      videoDataSet,
      audioDataSet,
      bandwidthDataSet,
      latencyDataSet,
      bufferSizeDataSet,
      playbackRateDataSet
    ] = this.#chart.data.datasets;
    const videoYData = videoDataSet.data.map(({ y }) => y);
    const audioYData = audioDataSet.data.map(({ y }) => y);
    const bandwidthYData = bandwidthDataSet.data.map(({ y }) => y);
    const latencyYData = latencyDataSet.data.map(({ y }) => y);
    const bufferSizeYData = bufferSizeDataSet.data.map(({ y }) => y);
    const playbackRateYData = playbackRateDataSet.data.map(({ y }) => y);
    this.#chart.options.scales.videoYAxis.max = Math.ceil(Math.max(...videoYData, 0) + 5000);
    this.#chart.options.scales.audioYAxis.max = Math.ceil(Math.max(...audioYData, 0) + 5000);
    this.#chart.options.scales.bandwidthYAxis.max = Math.ceil(Math.max(...bandwidthYData, 0) + 5000);
    this.#chart.options.scales.latencyYAxis.max = Math.ceil(Math.max(...latencyYData, 0) + 1000);
    this.#chart.options.scales.bufferSizeYAxis.max = Math.ceil(Math.max(...bufferSizeYData, 0) + 5);
    this.#chart.options.scales.playbackRateYAxis.max = Math.ceil(Math.max(...playbackRateYData, 0) + 1);
  }
}

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

function generateInitialConfig() {
  return {
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
}
