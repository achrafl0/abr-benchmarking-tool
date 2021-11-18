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

const CURRENT_TIME_INTERVAL = 200;

/**
 * Report the evolution of the currentTime:
 *   - `0`: The new currentTime is before the previous one
 *   - `1`: The new currentTime is the same than the previous one
 *   - `2`: The new currentTime is too soon for regular playback
 *   - `3`: The new currentTime is around what it should be under regular
 *          playback.
 *   - `4`: The new currentTime is too late for regular playback
 *
 * Note that the evolution of the current might be linked to a playbackRate
 * change or even a seek.
 * TODO better handle those cases?
 * @param {Object} registerEvent
 * @param {HTMLMediaElement} mediaElement
 * @returns {Function} - Function allowing to stop registering the currentTime.
 */
export function currentTimeListener(registerEvent, mediaElement) {
  let lastCurrentTimeMeasure = null;
  const currentTimeId = setInterval(onCurrentTimeChange, CURRENT_TIME_INTERVAL);
  onCurrentTimeChange();

  return () => {
    clearInterval(currentTimeId);
  };

  function onCurrentTimeChange() {
    const newMeasure = {
      value: mediaElement.currentTime * 1000,
      timestamp: performance.now(),
    };
    if (lastCurrentTimeMeasure === null) {
      lastCurrentTimeMeasure = newMeasure;
      return;
    }

    const timeDiff = newMeasure.value - lastCurrentTimeMeasure.value;
    const currentItv = newMeasure.timestamp - lastCurrentTimeMeasure.timestamp;
    lastCurrentTimeMeasure = newMeasure;
    if (timeDiff === 0) {
      // We didn't play
      registerEvent.currentTime(1);
      return ;
    }
    if (timeDiff < 0) {
      // We played in reverse
      registerEvent.currentTime(0);
      return ;
    }
    const relativeDelta = Math.abs(timeDiff - currentItv);
    console.warn(timeDiff, currentItv, relativeDelta);
    if (relativeDelta < currentItv * 0.1) {
      // We played close to normally
      registerEvent.currentTime(3);
    } else if (timeDiff - currentItv < 0) {
      // We played too slow
      registerEvent.currentTime(2);
    } else {
      // We played too fast
      registerEvent.currentTime(4);
    }
  }
}
