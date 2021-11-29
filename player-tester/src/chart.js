import { Chart, registerables } from "chart.js";
import { CHART_UPDATING_INTERVAL } from "./consts"

// TODO comment what this is doing
Chart.register(...registerables);

export default class ChartManager {
  /** Canvas on which the chart will be displayed. */
  canvas;

  /** If true, the chart is currently regularly updating. */
  #chartIsUpdating = false;

  /** Store setInterval id for  the interval refreshing the chart. */
  #chartUpdatingIntervalId = undefined;

  /** Chart.js Chart */
  #chart;

  /** The metrics on which we rely for the Chart's dataSet. */
  #metrics;

  /** Chart.js Chart configuration */
  #config;

  /**
   * Create a new ChartManager.
   * Once created, its associated canvas (and chart displayed in it) can be
   * retrieved through the `canvas` public property.
   *
   * @param {Object} metrics - Either a `MetricsStore` or a `MetricsStore`'s
   * data, respectively depending on if you might want to update that data or
   * not.
   * @param {boolean} shouldUpdate - If `true`, the chart should be periodically
   * updated to show new metrics.
   */
  constructor(metrics, shouldUpdate = false) {
    this.canvas = document.createElement("canvas");
    this.#config = generateInitialConfig();
    this.#chart = new Chart(this.canvas, this.#config);
    this.#metrics = metrics;
    if (shouldUpdate) {
      this.startUpdatingChart();
    }
  }

  startUpdatingChart() {
    if (this.#chartIsUpdating) {
      stopUpdatingChart();
    }
    this.#updateData();
    this.#chart.update();
    this.#chartUpdatingIntervalId = setInterval(() => {
      this.#updateData();
      this.#chart.update();
    }, CHART_UPDATING_INTERVAL);
    this.#chartIsUpdating = true;
  }

  stopUpdating() {
    this.#updateData();
    this.#chart.update();
    clearTimeout(this.#chartUpdatingIntervalId);
    this.#chartIsUpdating = false;
  }

  #updateData() {
    const datasets = this.#chart.data.datasets;
    datasets[0].data = this.#metrics.videoBitrates.slice()
      .map(([x, y]) => ({ x, y }));
    datasets[1].data = this.#metrics.audioBitrates.slice()
      .map(([x, y]) => ({ x, y }));
    datasets[2].data = this.#metrics.bufferSizes.slice()
      .map(([x, y]) => ({ x, y }));
    datasets[3].data = this.#metrics.playbackRates.slice()
      .map(([x, y]) => ({ x, y }));
    const videoYData = datasets[0].data.map(({ y }) => y);
    const audioYData = datasets[1].data.map(({ y }) => y);
    const bufferSizeYData = datasets[2].data.map(({ y }) => y);
    const playbackRateYData = datasets[3].data.map(({ y }) => y);
    this.#chart.options.scales.videoYAxis.max = Math.ceil(Math.max(...videoYData, 0) + 5000);
    this.#chart.options.scales.audioYAxis.max = Math.ceil(Math.max(...audioYData, 0) + 5000);
    this.#chart.options.scales.bufferSizeYAxis.max = Math.ceil(Math.max(...bufferSizeYData, 0) + 5);
    this.#chart.options.scales.playbackRateYAxis.max = Math.ceil(Math.max(...playbackRateYData, 0) + 1);
  }
}

function generateInitialConfig() {
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

  const bufferSizeSet = {
    label: "Buffer size (s)",
    borderColor: "#4DFF00",
    backgroundColor: "white",
    data: [],
    stepped: "before",
    fill: false,
    yAxisID: "bufferSizeYAxis",
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
  return {
    type: "line",
    data: {
      datasets: [
        videoSet,
        audioSet,
        bufferSizeSet,
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
          position: "right",
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
          position: "right",
          min: 0,
          max: 1000,
          ticks: {
            color: "#91cf96",
            callback: function (value, _index, _values) {
              return value + " kbps";
            },
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
