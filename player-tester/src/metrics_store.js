export default class MetricsStore {
  /** indicate a time origin for the x axis */
  #timeRef;
  #callbacks;
  audioBitrates;
  bufferSizes;
  videoBitrates;
  playbackRates;
  bufferingStates;

  constructor() {
    this.reset();
  }

  reset() {
    this.#timeRef = performance.now();
    this.#callbacks = {};
    this.audioBitrates = [];
    this.bufferSizes = [];
    this.videoBitrates = [];
    this.playbackRates = [];
    this.bufferingStates = [];
  }

  addUpdateListener(eventType, fn) {
    let cbsForEvent = this.#callbacks[eventType];
    if (cbsForEvent === undefined) {
      cbsForEvent = [];
      this.#callbacks[eventType] = cbsForEvent;
    }
    cbsForEvent.push(fn);

    return () => {
      const cbs = this.#callbacks[eventType];
      if (cbs === undefined) {
        return;
      }
      let indexOf = cbs.indexOf(fn);
      while (indexOf !== -1) {
        cbs.splice(indexOf, 1);
        indexOf = cbs.indexOf(fn);
      }
      if (cbs.length === 0) {
        delete this.#callbacks[eventType];
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

      case "buffering":
        this.bufferingStates.push([time, eventData]);
      break;

      default:
        throw new Error("Unknown metric: " + eventType);
    }
    this.#triggerEventUpdate(eventType, eventData);
  }

  exportData() {
    return {
      audioBitrates: this.audioBitrates,
      bufferSizes: this.bufferSizes,
      playbackRates: this.playbackRates,
      videoBitrates: this.videoBitrates,
      bufferingStates: this.bufferingStates,
    };
  }

  #triggerEventUpdate(eventType, eventData) {
    const cbs = this.#callbacks[eventType];
    if (cbs === undefined) {
      return;
    }
    cbs.forEach(cb => {
      try {
        cb(eventData);
      } catch (e) {
        const message = e && e.message ?
          "No error message" :
          e.message;
        throw new Error("Event listener has thrown: " + message);
      }
    });
  }
}
