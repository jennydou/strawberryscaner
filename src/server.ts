import express from "express";
import cors from "cors";
import multer from "multer";
import { parseReceipt } from "./receiptParser";
import { processReceiptImage } from "./receiptScanner";

import fs from "node:fs/promises";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";

const app = express();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ["image/jpeg", "image/png"].includes(file.mimetype)),
});

app.use(cors({ origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(",") : false }));

app.use("/api/", rateLimit({ windowMs: 60_000, limit: 10 }));

const API_KEY = process.env.API_KEY ?? "";
if (!API_KEY && process.env.NODE_ENV === "production") {
  console.error("API_KEY is required in production");
  process.exit(1);
}
app.use("/api/", (req, res, next) => {
  if (!API_KEY) return next();
  const given = Buffer.from(req.header("x-api-key") ?? "");
  const expected = Buffer.from(API_KEY);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

app.use(express.json({ limit: "20kb" }));

app.post("/api/parse", (req, res) => {
  const text = req.body?.text;
  if (typeof text !== "string" || text.trim() === "") {
    res.status(400).json({ error: "Nav teksta" });
    return;
  }
  res.json(parseReceipt(text));
});

app.post("/api/scan", upload.single("receipt"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Nav faila" });
    return;
  }
const filePath = req.file.path;
try {
  const scan = await processReceiptImage(filePath);
  if (!scan.success) {
    console.error("OCR failed:", scan.error);
    res.status(500).json({ error: "Scan failed" });
    return;
  }
  res.json(parseReceipt(scan.rawText));
} finally {
  await fs.unlink(filePath).catch(() => {});
}
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.code === "LIMIT_FILE_SIZE" ? 413 : err?.status ?? 500;
  res.status(status).json({ error: status >= 500 ? "Internal error" : "Request rejected" });
});

app.listen(3000, () => console.log("API: http://localhost:3000"));