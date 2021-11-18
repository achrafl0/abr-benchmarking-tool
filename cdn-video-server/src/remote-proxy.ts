import http from "http";
import https from "https";
import { Router } from "express";

const router = Router();

router.use("/proxy", (req, res) => {
  const url = new URL(req.originalUrl.substring(7));
  const headers = { ...req.headers };

  // TODO
  delete headers.host;

  const auth =
    url.username !== "" || url.password !== ""
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

  function reqCb(realRes: http.IncomingMessage) {
    res.writeHead(realRes.statusCode ?? 200, realRes.headers);
    realRes.pipe(res);
  }
});

export default router;
