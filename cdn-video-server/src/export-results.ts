import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

router.post("/report", (req, res) => {
  const date = new Date().toJSON().slice(0, 10);
  const { player } = req.body;
  const title = `${date}-${player}.json`;
  fs.writeFileSync(path.join(__dirname, "..", "static", "data", title), JSON.stringify(req.body));
  res.status(200).json({ title });
});

export default router;
