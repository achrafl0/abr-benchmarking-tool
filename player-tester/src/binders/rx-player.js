import { getBandwidth } from "../network";
import { registerEvent } from "../chart";
import { computeBufferSize, currentTimeListener } from "../utils";


/**
 * Bind the player-tester to RxPlayer events
 * @param {Object} player - The RxPlayer instance
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content plays.
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToRxPlayer(player, videoElement) {
  let videoBitrateItv;
  let audioBitrateItv;
  player.addEventListener("audioBitrateChange", onAudioBitrateChange);
  player.addEventListener("videoBitrateChange", onVideoBitrateChange);
  player.addEventListener("playerStateChange", onPlayerStateChange);

  const stopListeningCurrentTime = currentTimeListener(registerEvent, videoElement);
  const rateChange = setInterval(onPlaybackRateChange, 1000);

  const bandwidthItv = setInterval(async () => {
    await getBandwidth();
  }, 1000);

  const bufferSizeItv = setInterval(() => {
    const bufferSize = computeBufferSize(videoElement);
    registerEvent.bufferSize(bufferSize);
  }, 100);

  function onPlaybackRateChange() {
    registerEvent.playbackRate(videoElement.playbackRate);
  }

  function onAudioBitrateChange(bitrate) {
    clearInterval(audioBitrateItv);
    registerEvent.audioBitrate(bitrate);
    audioBitrateItv = setInterval(() => {
      registerEvent.audioBitrate(bitrate);
    }, 1000);
  }

  function onVideoBitrateChange(bitrate) {
    clearInterval(videoBitrateItv);
    registerEvent.videoBitrate(bitrate);
    videoBitrateItv = setInterval(() => {
      registerEvent.videoBitrate(bitrate);
    }, 1000);
  }

  async function onPlayerStateChange(state) {
    if (state === "LOADED") {
      await getBandwidth();
      videoElement.onclick = function () {
        if (player.getPlayerState() === "PLAYING") {
          player.pause();
        } else {
          player.play();
        }
      };
    } else if (state === "LOADING" || state === "STOPPED") {
      videoElement.onclick = undefined;
    }
  }

  return () => {
    clearInterval(currentTimeId);
    // unbind event listeners
    stopListeningCurrentTime();
    clearInterval(audioBitrateItv);
    clearInterval(videoBitrateItv);
    clearInterval(liveEdge);
    clearInterval(rateChange);
    clearInterval(bandwidthItv);
    clearInterval(bufferSizeItv);
    player.removeEventListener("playerStateChange", onPlayerStateChange);
    player.removeEventListener("audioBitrateChange", onAudioBitrateChange);
    player.removeEventListener("videoBitrateChange", onVideoBitrateChange);
  };
}
