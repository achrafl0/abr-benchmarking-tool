import { Router } from "express";
import { IToxic } from "./toxiproxyTypes";
import Toxiproxy from "./utils";

const router = Router();

router.use("/add-toxic", (req, res) => {
  const toxic: IToxic = req.body;
  Toxiproxy.addToxic(toxic)
    .then(() => {
      res.status(200);
    })
    .catch(() => res.status(500));
});

router.use("/remove-toxic/:toxicName", (req, res) => {
  Toxiproxy.removeToxic(req.params.toxicName)
    .then(() => {
      res.status(200);
    })
    .catch(() => res.status(500));
});

router.use("/update-toxic/", (req, res) => {
  const toxic: IToxic = req.body;
  Toxiproxy.updateToxic(toxic)
    .then(() => {
      res.status(200);
    })
    .catch(() => res.status(500));
});

export default router;
