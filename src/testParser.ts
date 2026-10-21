import fs from "fs";
import path from "path";
import { parseReceipt } from "./receiptParser";

const folder = "test_receipts";
for (const file of fs.readdirSync(folder).filter(f => f.endsWith(".txt"))) {
  const text = fs.readFileSync(path.join(folder, file), "utf-8");
  console.log(file, JSON.stringify(parseReceipt(text), null, 2));
}