import { Router } from "express";
import { IToxic } from "./toxiproxyTypes";
import Toxiproxy from "./utils";

const router = Router();

router.post("/toxics", (req, res) => {
  const toxics: IToxic[] = req.body;
  if (!Array.isArray(toxics)) {
    // TODO better return?
    res.status(500);
  }
  Toxiproxy.updateToxics(toxics)
    .then(() => res.status(200))
    .catch(() => res.status(500));
});

router.delete("/toxics", (_req, res) => {
  Toxiproxy.removeCurrentToxics()
    .then(() => res.status(200))
    .catch(() => res.status(500));
});

export default router;
