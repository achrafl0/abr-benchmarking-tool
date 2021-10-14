import express from "express";
import path from "path";
import toxiproxyRouter from "./toxiproxyRouter";
import {
  CDN_PORT,
  toxiproxyClient,
  TOXIPROXY_PORT,
  PROXY_NAME,
} from "./config";
const app = express();
app.use(express.json())
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(
  "/videos",
  express.static(path.join(__dirname, "..", "static", "videos"))
);

app.use(toxiproxyRouter)
app.listen(CDN_PORT, () => {
  console.log(`The videoserver is listening on port ${CDN_PORT} !`);
  toxiproxyClient
    .populate([
      {
        listen: `localhost:${TOXIPROXY_PORT}`,
        name: PROXY_NAME,
        upstream: `localhost:${CDN_PORT}`,
      },
    ])
    .then(() => {
      console.log(
        `Toxiproxy has started up and is listening on port ${TOXIPROXY_PORT} !`
      );
    })
    .catch(() => {
      console.warn(`Toxiproxy couldn't not launch :( `);
    });
});
