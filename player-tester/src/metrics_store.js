import { CDN_SERVER_URL } from "./consts";


export default class MetricsStore {
  /** indicate a time origin for the x axis */
  #timeRef;
  #callbacks;
  audioBitrates;
  bufferSizes;
  videoBitrates;
  playbackRates;

  constructor() {
    this.#timeRef = performance.now();
    this.#callbacks = [];
    this.audioBitrates = [];
    this.bufferSizes = [];
    this.videoBitrates = [];
    this.playbackRates = [];
  }

  reset() {
    this.#timeRef = performance.now();
    this.#callbacks = [];
    this.audioBitrates = [];
    this.bufferSizes = [];
    this.videoBitrates = [];
    this.playbackRates = [];
  }

  addUpdateListener(fn) {
    this.#callbacks.push(fn);
    return () => {
      let indexOf = this.#callbacks.indexOf(fn);
      while (indexOf !== -1) {
        this.#callbacks.splice(indexOf, 1);
        indexOf = this.#callbacks.indexOf(fn);
      }
    };
  }

  registerEvent(eventType, eventData) {
    const time = (performance.now() - this.#timeRef) / 1000;
    switch (eventType) {
      case "audioBitrate":
        this.audioBitrates.push([time, eventData]);
      break;

      case "videoBitrate":
        this.videoBitrates.push([time, eventData]);
      break;

      case "bufferSize":
        this.bufferSizes.push([time, eventData]);
      break;

      case "playbackRate":
        this.playbackRates.push([time, eventData]);
      break;

      default:
        throw new Error("Unknown metric: " + eventType);
    }

    this.#callbacks.forEach(cb => {
      try {
        cb();
      } catch (e) {
        const message = e && e.message ?
          "No error message" :
          e.message;
        throw new Error("Event listener has thrown: " + message);
      }
    });
  }

  exportData() {
    return {
      audioBitrates: this.audioBitrates,
      bufferSizes: this.bufferSizes,
      playbackRates: this.playbackRates,
      videoBitrates: this.videoBitrates,
    };
  }
}
