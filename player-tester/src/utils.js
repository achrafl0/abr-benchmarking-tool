/**
 * Computes the difference between the end of the current time range and the
 * current position from the given HTMLMediaElement.
 * @param {HTMLMediaElement} mediaElement
 * @returns {number}
 */
export function computeBufferSize(mediaElement) {
  const { buffered, currentTime } = mediaElement;
  if (buffered.length == 0) {
    return 0;
  } else {
    
    for (let i = buffered.length ; i > 0; i--) {
      if (currentTime >= buffered.start(i-1) && currentTime < buffered.end(i-1)) {
        return buffered.end(i-1) - currentTime;
      }
    }
    return 0;
  }
}

export function updateToxics(
  bandwidthConfig,
  latencyConfig
) {
  return fetch("http://127.0.0.1:5001/toxics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bandwidth: bandwidthConfig,
      latency: latencyConfig,
    }),
  });
}
