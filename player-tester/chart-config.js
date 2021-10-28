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
const bufferSizeSet = {
  label: "Buffer size (s)",
  borderColor: "#4DFF00",
  backgroundColor: "white",
  data: [],
  stepped: "before",
  fill: true,
  yAxisID: "bufferSizeYAxis"
}

export var config = {
  type: "line",
  data: { datasets: [videoSet, audioSet, bandwidthSet, latencySet, bufferSizeSet] },
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
      bufferSizeYAxis: {
        title: {
          display: true,
          text: "Buffer Size",
        },
        type: "linear",
        position: "left",
        min: 0,
        max: 180,
        ticks: {
          color: (x) => "#4DFF00",
          callback: function (value, index, values) {
            return value + " s";
          },
        },
      },
      xAxis: {
        title: {
          display: true,
          text: "Time"
        },
        type: "linear",
        min: 0,
        ticks: {
          color: (x) => "black",
          callback: function (value, index, values) {
            return value + " s";
          },
        } 
      }
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

export var myChart = new Chart(document.getElementById("myChart"), config);

export const globalRegisterData = (
  data,
  index,
  startTime
) => {
  const deltaTime = (performance.now() - startTime) / 1000

  myChart.data.datasets[index].data = [
    ...myChart.data.datasets[index].data,
    { y: data, x: deltaTime },
  ];
  myChart.update();
};
export const registerEvent = {
  audioBitrate: (bit, startTime) => {
    globalRegisterData(bit, 1, startTime);
  },
  videoBitrate: (bit, startTime) => {
    globalRegisterData(bit, 0, startTime);
  },
  latency: (latency, startTime) => {
    globalRegisterData(latency, 3, startTime);
  },
  bandwidth: (bandwidth, startTime) => {
    globalRegisterData(bandwidth, 2, startTime);
  },
  bufferSize: (buffersize, startTime) => {
    globalRegisterData(buffersize, 4, startTime)
  }
};

export const dumpData = () => {
  return myChart.data.datasets.map((dataset)=> dataset.data)
}

export const isVideoBitrateConstantSince = (startTime, since = 5) => {
  var videoData = myChart.data.datasets[0].data
  var lastBitrateTime = videoData[videoData.length - 1].x
  return (performance.now() - startTime)/1000 - since > lastBitrateTime
}

export const cheatVideoData = (startTime) => {
  var videoData = myChart.data.datasets[0].data
  var lastBitrate = videoData[videoData.length - 1].y
  registerEvent.videoBitrate(lastBitrate, startTime)
}