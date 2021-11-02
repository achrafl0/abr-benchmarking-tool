import {
  Bandwidth,
  Latency,
} from "toxiproxy-node-client";

export const CDN_PORT = 5000;
export const TOXIPROXY_PORT = 5001;
export const PROXY_NAME = "cdn-abr";

export const DEFAULT_BANDWITH: Bandwidth = {
  rate: 15 * 1000,
};
export const DEFAULT_LATENCY: Latency = {
  latency: 20,
  jitter: 10,
};
export const TOXIPROXY_SERVER = "http://localhost:8474";
