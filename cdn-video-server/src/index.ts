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
  const url = req.originalUrl.substring(7);
  if (url.substring(0, 6) === "https:") {
    https.get(url, (realRes) => {
      res.writeHead(realRes.statusCode ?? 200, realRes.headers);
      realRes.pipe(res);
    });
  } else if (url.substring(0, 5) === "http:") {
    http.get(url, (realRes) => {
      res.writeHead(realRes.statusCode ?? 200, realRes.headers);
      realRes.pipe(res);
    });
  }
  // TODO better response if not handled
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
