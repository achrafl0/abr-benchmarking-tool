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

export function resetToxics() {
  return fetch("http://127.0.0.1:5001/toxics", { method: "DELETE" });
}

export function updateToxics(
  bandwidthConfig,
  latencyConfig
) {
  const toxicsSent = [];
  if (bandwidthConfig !== undefined && bandwidthConfig !== null) {
    toxicsSent.push({
      type: "bandwidth",
      toxicity: bandwidthConfig.toxicity,
      attributes: { rate: bandwidthConfig.rate },
    });
  }
  if (latencyConfig !== undefined && latencyConfig !== null) {
    toxicsSent.push({
      type: "latency",
      toxicity: latencyConfig.toxicity,
      attributes: {
        latency: latencyConfig.latency,
        jitter: latencyConfig.jitter,
      },
    });
  }
  return fetch("http://127.0.0.1:5001/toxics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(toxicsSent),
  });
}

/**
 * @param {HTMLMediaElement} mediaElement
 * @param {Object} metricsStore
 * @returns {Function}
 */
export function emitBufferingEvents(
  mediaElement,
  metricsStore
) {
  let wasBuffering = false;

  mediaElement.addEventListener("loadeddata", onBufferingRelatedEvent);
  mediaElement.addEventListener("loadedmetadata", onBufferingRelatedEvent);
  mediaElement.addEventListener("canplay", onBufferingRelatedEvent);
  mediaElement.addEventListener("canplaythrough", onBufferingRelatedEvent);
  mediaElement.addEventListener("waiting", onBufferingRelatedEvent);
  mediaElement.addEventListener("suspend", onBufferingRelatedEvent);
  mediaElement.addEventListener("emptied", onBufferingRelatedEvent);
  mediaElement.addEventListener("stalled", onBufferingRelatedEvent);
  mediaElement.addEventListener("ratechange", onBufferingRelatedEvent);
  mediaElement.addEventListener("pause", onBufferingRelatedEvent);
  mediaElement.addEventListener("play", onBufferingRelatedEvent);
  mediaElement.addEventListener("playing", onBufferingRelatedEvent);
  mediaElement.addEventListener("seeking", onBufferingRelatedEvent);
  mediaElement.addEventListener("seeked", onBufferingRelatedEvent);
  onBufferingRelatedEvent();

  function onBufferingRelatedEvent() {
    if (!wasBuffering) {
      if (
        mediaElement.readyState < 3 ||
        mediaElement.playbackRate === 0 ||
        mediaElement.seeking ||
        mediaElement.paused
      ) {
        metricsStore.registerEvent("buffering", true);
        wasBuffering = true;
      }
    } else {
      if (
        mediaElement.readyState > 3 &&
        mediaElement.playbackRate !== 0 &&
        !mediaElement.seeking &&
        !mediaElement.paused
      ) {
        metricsStore.registerEvent("buffering", false);
        wasBuffering = false;
      }
    }
  }

  return () => {
    mediaElement.removeEventListener("loadeddata", onBufferingRelatedEvent);
    mediaElement.removeEventListener("loadedmetadata", onBufferingRelatedEvent);
    mediaElement.removeEventListener("canplay", onBufferingRelatedEvent);
    mediaElement.removeEventListener("canplaythrough", onBufferingRelatedEvent);
    mediaElement.removeEventListener("waiting", onBufferingRelatedEvent);
    mediaElement.removeEventListener("suspend", onBufferingRelatedEvent);
    mediaElement.removeEventListener("emptied", onBufferingRelatedEvent);
    mediaElement.removeEventListener("stalled", onBufferingRelatedEvent);
    mediaElement.removeEventListener("ratechange", onBufferingRelatedEvent);
    mediaElement.removeEventListener("pause", onBufferingRelatedEvent);
    mediaElement.removeEventListener("play", onBufferingRelatedEvent);
    mediaElement.removeEventListener("playing", onBufferingRelatedEvent);
    mediaElement.removeEventListener("seeking", onBufferingRelatedEvent);
    mediaElement.removeEventListener("seeked", onBufferingRelatedEvent);
  };
}
