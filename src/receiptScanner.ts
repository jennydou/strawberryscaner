import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

// Интерфейс результата сканирования
export interface ScanResult {
  success: boolean;
  rawText: string;
  error?: string;
}

/**
 * Предобработка изображения:
 * Перевод в оттенки серого, нормализация контрастности и повышение четкости
 */
async function preprocessImage(imagePath: string): Promise<Buffer> {
  return await sharp(imagePath)
    .grayscale()
    .normalise()
    .sharpen()
    .toBuffer();
}

/**
 * Основная функция распознавания текста чека
 */
export async function processReceiptImage(imagePath: string): Promise<ScanResult> {
  let worker;
  try {
    // 1. Подготавливаем очищенный Buffer изображения
    const cleanBuffer = await preprocessImage(imagePath);

    // 2. Инициализируем Tesseract с поддержкой латышского (lav) и английского (eng) языков
    worker = await createWorker(['lav', 'eng']);

    // 3. Считываем текст с изображения
    const { data: { text } } = await worker.recognize(cleanBuffer);

    // 4. Завершаем работу воркера
    await worker.terminate();

    return {
      success: true,
      rawText: text
    };
  } catch (error) {
    if (worker) await worker.terminate();
    return {
      success: false,
      rawText: '',
      error: error instanceof Error ? error.message : 'Skenēšanas kļūda' // Ошибка сканирования на латышском
    };
  }
}