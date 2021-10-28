import { testRxplayer } from "./test-rx";
//import { testDashJs } from "./test-dashjs";
const videoElement = document.querySelector("video");
const LOCAL_MPD_URL =
  "http://localhost:5001/videos/BigBuckBunny/2sec/BigBuckBunny_2s_simple_2014_05_09.mpd";
const PROXY_MPD_URL = "http://localhost:5001/proxy/dash/tears_of_steel/cleartext/stream.mpd"
testRxplayer(videoElement, LOCAL_MPD_URL)
//testDashJs(videoElement, MPD_URL)