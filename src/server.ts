import express from "express";
import cors from "cors";
import multer from "multer";
import { parseReceipt } from "./receiptParser";
import { processReceiptImage } from "./receiptScanner";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

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
  const scan = await processReceiptImage(req.file.path);
  if (!scan.success) {
    res.status(500).json({ error: scan.error });
    return;
  }
  res.json(parseReceipt(scan.rawText));
});

app.listen(3000, () => console.log("API: http://localhost:3000"));