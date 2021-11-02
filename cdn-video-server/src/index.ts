import http from "http";
import https from "https";
import express from "express";
import path from "path";
import toxiproxyRouter, {
  toxiproxy,
} from "./toxiproxyRouter";
import {
  CDN_PORT,
  TOXIPROXY_PORT,
  PROXY_NAME,
} from "./config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use("/proxy", (req, res) => {
  const url = new URL(req.originalUrl.substring(7));
  const headers = { ...req.headers };

  // TODO
  delete headers.host;

  const auth = url.username !== "" || url.password !== ""
    ? undefined
    : `${url.username}:${url.password}`;

  const reqOptions = {
    auth,
    hostname: url.host,
    path: url.pathname + url.search,
    hash: url.hash,
    port: url.port,
    headers,
  };

  if (url.protocol === "https:") {
    https.get(reqOptions, reqCb);
  } else if (url.protocol === "http:") {
    http.get(reqOptions, reqCb);
  } else {
    res.status(422).send({
      success: false,
      error: "Asked resource was neither HTTP nor HTTPS",
    });
  }

  function reqCb(realRes : http.IncomingMessage) {
    res.writeHead(realRes.statusCode ?? 200, realRes.headers);
    realRes.pipe(res);
  }
});

app.use(
  "/videos",
  express.static(path.join(__dirname, "..", "static", "videos")),
);

app.use(toxiproxyRouter);

app.listen(CDN_PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log(`The content server is listening on port ${CDN_PORT} !`);
  toxiproxy.populate([
    {
      listen: `localhost:${TOXIPROXY_PORT}`,
      name: PROXY_NAME,
      upstream: `localhost:${CDN_PORT}`,
    },
  ]).then(() => {
    /* eslint-disable-next-line no-console */
    console.log(
      `Toxiproxy has started up and is listening on port ${TOXIPROXY_PORT} !`,
    );
  }).catch(() => {
    /* eslint-disable-next-line no-console */
    console.warn("Toxiproxy couldn't not launch :( ");
  });
});
