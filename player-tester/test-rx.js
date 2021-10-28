import RxPlayer from "rx-player";
import { getBandwidth } from "./network";
import { registerEvent } from "./chart-config";

export const testRxplayer = (videoElement, mpdUrl) => {
    const player = new RxPlayer({
        videoElement,
      });
      player.loadVideo({
        url: mpdUrl,
        transport: "dash",
        autoPlay: true,
      });
      player.addEventListener("audioBitrateChange", registerEvent.audioBitrate);
      
      player.addEventListener("videoBitrateChange", registerEvent.videoBitrate);

      setInterval(async () => {
        if (player.getPlayerState() === "PLAYING"){
            await getBandwidth();
        }
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
}