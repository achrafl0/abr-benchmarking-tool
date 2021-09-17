import { Bandwidth, Latency, Toxiproxy, Proxy } from "toxiproxy-node-client";

export const CDN_PORT = 5000;
export const TOXIPROXY_PORT = 5001;
export const PROXY_NAME = "cdn-abr";

export const MBITS = 1000;
export const DEFAULT_BANDWITH: Bandwidth = {
  rate: 15 * MBITS, 
}; 
export const DEFAULT_LATENCY: Latency = {
  latency: 20,
  jitter: 10,
}; // 20ms + some jitter
export const TOXIPROXY_SERVER = "http://localhost:8474";

export const toxiproxyClient = new Toxiproxy(TOXIPROXY_SERVER);
export const cdnProxy = new Proxy(toxiproxyClient, {
    listen: `localhost:${TOXIPROXY_PORT}`,
    name: PROXY_NAME,
    upstream: `localhost:${CDN_PORT}`,
    enabled: true,
    toxics: []
})