import dashjs from "dashjs";
import { getBandwidth } from "../network";
import { registerEvent } from "../chart";
import { computeBufferSize, currentTimeListener } from "../utils";

/**
 * Bind the player-tester to DASH.js events
 * @param {Object} player - The DASH.js instance
 * @param {HTMLMediaElement} videoElement - The media element on which the
 * content plays.
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToDashjs(player, videoElement) {
  let currentTime = 0;
  player.on(
    dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
    onVideoBitrateChange
  );

  const currentTimeId = setInterval(onCurrentTimeChange, 1000);
  const rateChange = setInterval(onPlaybackRateChange, 1000);

  function onPlaybackRateChange() {
    registerEvent.playbackRate(videoElement.playbackRate);
  }

  function onCurrentTimeChange(time) {
    if (videoElement.currentTime === currentTime) {
      registerEvent.currentTime(0);
      return;
    }
    registerEvent.currentTime(1);
    currentTime = videoElement.currentTime;
  }
  player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (a) => {
    console.log(a);
    console.log(player.getQualityFor("video"));
  });

  const stopListeningCurrentTime = currentTimeListener(registerEvent, videoElement);
  const liveEdgeInterval = setInterval(onDetectLiveEdge, 100);
  videoElement.addEventListener("ratechange", updatePlaybackRate);
  function onVideoBitrateChange({ newQuality }) {
    const bitrate = player.getBitrateInfoListFor("video")[newQuality].bitrate;
    registerEvent.videoBitrate(bitrate);
  }

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    registerEvent.bufferSize(bufferSize);
  }, 100);

  function onDetectLiveEdge() {
    const len = videoElement.buffered.length;
    if (len > 0) {
      console.warn("DASHJS", videoElement.buffered.end(len - 1));
    }
  }

  function updatePlaybackRate() {
    registerEvent.playbackRate(videoElement.playbackRate);
  }

  return () => {
    clearInterval(currentTimeId);
    clearInterval(rateChange);
    stopListeningCurrentTime();
    clearInterval(liveEdgeInterval);
    clearInterval(bufferSizeItv);
    clearInterval(bandwidthItv);
    player.off(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED);
    videoElement.removeEventListener("ratechange", updatePlaybackRate);
  };
}
