import express from "express";
import path from "path";
import remoteProxyRouter from "./remote-proxy"
import exportResultRouter from "./export-results"
import { CDN_PORT,} from "./config";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// Remote Proxy routes
app.use(remoteProxyRouter)

// Export results routes
app.use(exportResultRouter)

// Static Routes
app.use(
  "/videos",
  express.static(path.join(__dirname, "..", "static", "videos"))
);
app.use("/data", express.static(path.join(__dirname, "..", "static", "data")))


// Init
app.listen(CDN_PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log(`The content server is listening on port ${CDN_PORT} !`);
});
