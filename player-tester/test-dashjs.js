import dashjs from "dashjs";

export const testDashJs = (videoElement, mpdUrl) => {
    const player = dashjs.MediaPlayer().create();
    player.initialize(videoElement, mpdUrl, true);
    player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (a) => {
        console.log(a)
        console.log(player.getQualityFor('video'))
    })
}