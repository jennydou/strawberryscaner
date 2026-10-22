import { processReceiptImage } from './receiptScanner';
import * as path from 'path';

async function runTest() {
  // Путь к тестовому чеку
  const testImagePath = path.join(__dirname, '../receipts/test_rimi.jpg');

  console.log('⏳ Čeka apstrāde ar Tesseract OCR...'); // "Обработка чека через Tesseract OCR..."
  const result = await processReceiptImage(testImagePath);

  if (result.success) {
    console.log('\n✅ VEIKSMĪGI!\n'); // "Оно работает"
    console.log('--------------------------------------------------');
    console.log(result.rawText);
    console.log('--------------------------------------------------');
  } else {
    console.error('❌ Kļūda atpazīšanā:', result.error); // "Оно не работает (кто бы мог подумать)"
  }
}

runTest();