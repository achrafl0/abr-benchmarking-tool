import express from "express";
import proxy from "express-http-proxy";
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

app.use("/proxy/:url", (req, res, next) => {
  const url = req.originalUrl.substring(7);
  return proxy(url)(req, res, next);
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
