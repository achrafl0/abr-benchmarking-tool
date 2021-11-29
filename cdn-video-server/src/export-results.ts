import { Router } from "express";
import path from "path";
import fs from "fs";

const REPORTS_ROOT_DIR = path.normalize(path.join(__dirname, "..", "static", "reports"));

const router = Router();

router.post("/report", (req, res) => {
  const { body } = req;

  let outputDir = REPORTS_ROOT_DIR;
  if (typeof body.directory === "string") {
    const { directory } = body;
    if (
      directory.indexOf("\0") !== -1
      || !/^[A-Za-z0-9.\-_: /]+$/.test(directory)
    ) {
      res.status(500).json({
        success: false,
        error: "Invalid directory name",
      });
      return;
    }
    outputDir = path.normalize(path.join(outputDir, directory));
    if (outputDir.indexOf(REPORTS_ROOT_DIR) !== 0) {
      res.status(500).json({
        success: false,
        error: "Illegal directory path",
      });
      return;
    }
  }

  if (typeof body.name !== "string") {
    res.status(500).json({
      success: false,
      error: "No report name",
    });
  }
  if (
    body.name.indexOf("\0") !== -1
    || !/^[A-Za-z0-9.\-:_ ]+$/.test(body.name)
  ) {
    res.status(500).json({
      success: false,
      error: "Invalid file name",
    });
    return;
  }

  if (typeof body.data !== "object") {
    res.status(500).json({
      success: false,
      error: "No report data",
    });
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, body.name), JSON.stringify(body.data));
  res.status(200).json({ success: true });
});

export default router;
