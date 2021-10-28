import { registerEvent } from "./chart-config";

const BANDWIDTH_URL = "http://localhost:5000/bandwidth";
export const getBandwidth = async (startTime = 0) => {
  fetch(BANDWIDTH_URL)
    .then((response) => response.json())
    .then((network) => {
      registerEvent.bandwidth(
        network.bandwidth.rate,
        startTime
      );
      registerEvent.latency(
        network.latency.latency + network.latency.jitter / 2,
        startTime
      );
    });
};
