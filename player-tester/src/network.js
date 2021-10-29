import { registerEvent } from "./chart";

const BANDWIDTH_URL = "http://localhost:5000/bandwidth";

/**
 * TODO remove, we should update network conditions in scenarios and don't need
 * to fetch it that way.
 * @param {number|undefined}  startTime = 0 - `performance.now()` at the time
 * the content started.
 */
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
