const videoElement = document.getElementById("video");
const player = new window.RxPlayer({
  videoElement,
});
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

const config = {
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
var myChart = new Chart(document.getElementById("myChart"), config);

const getBandwidth = async () => {
  fetch("http://localhost:5000/bandwidth")
    .then((response) => response.json())
    .then((network) => {
      myChart.data.datasets[2].data = [
        ...myChart.data.datasets[2].data,
        {
          y: network.bandwidth.rate,
          x: new Date().toISOString(),

        },
      ];
      myChart.data.datasets[3].data = [
        ...myChart.data.datasets[3].data,
        {
          y: network.latency.latency + network.latency.jitter / 2,
          x: new Date.toISOString(),
        },
      ];
      myChart.update();
    });
};

player.loadVideo({
  url: "http://localhost:5001/videos/BigBuckBunny/2sec/BigBuckBunny_2s_simple_2014_05_09.mpd",
  transport: "dash",
  autoPlay: true,
});

player.addEventListener("audioBitrateChange", (bit) => {
  myChart.data.datasets[1].data = [
    ...myChart.data.datasets[1].data,
    { y: bit, x: new Date().toISOString() },
  ];
  myChart.update();
});

player.addEventListener("videoBitrateChange", (bit) => {
  myChart.data.datasets[0].data = [
    ...myChart.data.datasets[0].data,
    { y: bit, x: new Date().toISOString() },
  ];
  myChart.update();
});

setInterval(async () => {
  await getBandwidth();
}, 1000);

player.addEventListener("playerStateChange", async (state) => {
  if (state === "LOADED") {
    await getBandwidth();
    videoElement.onclick = function () {
      if (player.getPlayerState() === "PLAYING") {
        player.pause();
      } else {
        player.play();
      }
    };
  }
});

window.player = player;
