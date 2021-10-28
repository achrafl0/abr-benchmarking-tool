import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const formatTime = (data) => {
  return data.map(({ x, y }) => {
    return {
      y,
      x: new Date(x).toISOString(),
    };
  });
};

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

export var config = {
  type: "line",
  data: { datasets: [videoSet, audioSet, bandwidthSet, latencySet] },
  options: {
    scales: {
      audioYAxis: {
        title: { text: "Audio bitrate", display: true },
        type: "linear",
        position: "left",
        min: -1,
        max: 1000,
        ticks: {
          color: "#ffbaa2",
          callback: function (value, index, values) {
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
          callback: function (value, index, values) {
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
          callback: function (value, index, values) {
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
          color: (x) => "#29b6f6",
          callback: function (value, index, values) {
            return value + " ms";
          },
        },
        scaleLabel: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0, // disables bezier curves
      },
      point: {
        radius: 4,
        borderWidth: 2,
        pointStyle: "circle",
      },
    },
  },
};

export var myChart = new Chart(document.getElementById("myChart"), config);

export const globalRegisterData = (
  data,
  index,
  timestamp = new Date().toISOString()
) => {
  myChart.data.datasets[index].data = [
    ...myChart.data.datasets[index].data,
    { y: data, x: timestamp },
  ];
  myChart.update();
};
export const registerEvent = {
  audioBitrate: (bit) => {
    globalRegisterData(bit, 1);
  },
  videoBitrate: (bit) => {
    globalRegisterData(bit, 0);
  },
  latency: (latency) => {
    globalRegisterData(latency, 3);
  },
  bandwidth: (bandwidth) => {
    globalRegisterData(bandwidth, 2);
  },
};
