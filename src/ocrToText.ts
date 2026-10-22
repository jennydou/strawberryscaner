import { processReceiptImage } from "./receiptScanner";

processReceiptImage(process.argv[2]).then(r => console.log(r.rawText));