// import { Router } from "express";
// import {
//   Bandwidth,
//   Latency,
//   Proxy,
//   Toxic,
//   Toxiproxy,
// } from "toxiproxy-node-client";
// import {
//   CDN_PORT,
//   PROXY_NAME,
//   TOXIPROXY_PORT,
//   TOXIPROXY_SERVER,
// } from "./config";

// export const toxiproxy = new Toxiproxy(TOXIPROXY_SERVER);
// export const toxiproxyProxy = new Proxy(toxiproxy, {
//   listen: `localhost:${TOXIPROXY_PORT}`,
//   name: PROXY_NAME,
//   upstream: `localhost:${CDN_PORT}`,
//   enabled: true,
//   toxics: [],
// });

// const router = Router();

// router.get("/bandwidth", async (_req, res) => {
//   const proxy = await toxiproxyProxy.update();
//   await proxy.refreshToxics();
//   const network : {
//     bandwidth?: {
//       toxicity: number;
//       rate?: number;
//     };
//     latency?: {
//       toxicity: number;
//       latency?: number;
//       jitter?: number;
//     };
//   } = {};
//   proxy.toxics.forEach((toxic) => {
//     if (toxic.type === "bandwidth") {
//       network.bandwidth = {
//         toxicity: toxic.toxicity,
//         ...toxic.attributes as Bandwidth,
//       };
//       network.bandwidth.toxicity = toxic.toxicity;
//     }
//     if (toxic.type === "latency") {
//       network.latency = {
//         toxicity: toxic.toxicity,
//         ...toxic.attributes as Latency,
//       };
//     }
//   });
//   return res.json(network);
// });

// router.post("/toxics", async (req, res) => {
//   const { body } = req;
//   const proxy = toxiproxyProxy;
//   await proxy.refreshToxics();
//   await Promise.all(proxy.toxics.map((toxic) => toxic.remove()));

//   const proms : Array<Promise<unknown>> = [];
//   const updates = [];
//   if (typeof body.latency === "object") {
//     const toxicity = body.latency.toxicity ?? 1;
//     const latencyToxic = new Toxic<Latency>(proxy, {
//       attributes: body.latency,
//       toxicity,
//       name: "latency_downstream",
//       stream: "downstream",
//       type: "latency",
//     });
//     updates.push({
//       type: "latency",
//       value: {
//         attributes: body.latency,
//         toxicity,
//       },
//     });
//     proms.push(proxy.addToxic(latencyToxic));
//   }
//   if (typeof body.bandwidth === "object") {
//     const toxicity = body.bandwidth.toxicity ?? 1;
//     const bandwidthToxic = new Toxic<Bandwidth>(proxy, {
//       attributes: body.bandwidth,
//       toxicity,
//       name: "bandwidth_downstream",
//       stream: "downstream",
//       type: "bandwidth",
//     });
//     updates.push({
//       type: "bandwidth",
//       value: {
//         attributes: body.bandwidth,
//         toxicity,
//       },
//     });
//     proms.push(proxy.addToxic(bandwidthToxic));
//   }

//   await Promise.all(proms);

//   return res.status(200).send({
//     success: true,
//     updates,
//   });
// });

// export default router;
