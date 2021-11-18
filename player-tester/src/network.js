import { registerEvent } from "./chart";

const BANDWIDTH_URL = "http://localhost:5000/bandwidth";

/**
 * TODO remove, we should update network conditions in scenarios and don't need
 * to fetch it that way.
 * @param {number|undefined}  startTime = 0 - `performance.now()` at the time
 * the content started.
 */
export const getBandwidth = async () => {
  return Promise.resolve({
    bandwidth: {
      toxicity: 0,
      rate: 0,
    },
    latency: {
      toxicity: 0,
      latency: 0,
      jitter: 0,
    },
  });
};
// export const getBandwidth = async (startTime = 0) => {
//   fetch(BANDWIDTH_URL)
//     .then((response) => response.json())
//     .then((network) => {
//       if (network.bandwidth !== undefined) {
//         registerEvent.bandwidth(
//           network.bandwidth.rate,
//           startTime
//         );
//       }
//       if (network.latency !== undefined) {
//         registerEvent.latency(
//           network.latency.latency + network.latency.jitter / 2,
//           startTime
//         );
//       }
//     });
// };
