import { Router } from "express";
import { IApiToxic } from "./toxiproxyTypes";
import Toxiproxy from "./utils";

const router = Router();

router.post("/toxics", (req, res) => {
  const toxics: IApiToxic[] = req.body;
  if (!Array.isArray(toxics)) {
    res.status(500).json({
      success: false,
      error: "Toxics should be in an array.",
    });
  }
  Toxiproxy.updateToxics(toxics)
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => {
      const message = err?.message ?? "Unknown update error";
      res.status(500).json({
        success: false,
        error: message,
      });
    });
});

router.delete("/toxics", (_req, res) => {
  Toxiproxy.removeCurrentToxics()
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => {
      const message = err?.message ?? "Unknown update error";
      res.status(500).json({
        success: false,
        error: message,
      });
    });
});

export default router;
