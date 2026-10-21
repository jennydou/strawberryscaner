
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReceiptItem = {
  name: string;
  quantity: number;
  price: number;
  category: string;
};

export type Receipt = {
  id: string;
  store: string;
  date: string;
  time?: string;
  total: number;
  items: ReceiptItem[];
};

const STORAGE_KEY = "receipt_tracker_saved_receipts";

// Check receipt before saving
export function validateReceipt(receipt: Receipt): string | null {
  if (!receipt.id || !receipt.id.trim()) {
    return "Receipt ID is missing";
  }

  if (!receipt.store || !receipt.store.trim()) {
    return "Store name is missing";
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(receipt.date) ||
    !Number.isFinite(Date.parse(receipt.date))
  ) {
    return "Invalid date";
  }

  if (!Number.isFinite(receipt.total) || receipt.total < 0) {
    return "Invalid total";
  }

  if (!Array.isArray(receipt.items) || receipt.items.length === 0) {
    return "Receipt has no products";
  }

  for (const item of receipt.items) {
    if (!item.name?.trim() || !item.category?.trim()) {
      return "Product name or category is missing";
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return "Invalid quantity";
    }

    if (!Number.isFinite(item.price) || item.price < 0) {
      return "Invalid product price";
    }
  }

  const itemsTotal = receipt.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  if (Math.abs(itemsTotal - receipt.total) > 0.02) {
    return "Product prices do not match receipt total";
  }

  return null;
}

// Load receipts from device
export async function getReceipts(): Promise<Receipt[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved receipt data is invalid");
  }

  return parsed as Receipt[];
}

// Save a new receipt
export async function saveReceipt(receipt: Receipt) {
  const error = validateReceipt(receipt);
  if (error) throw new Error(error);

  const existing = await getReceipts();

  if (existing.some((item) => item.id === receipt.id)) {
    throw new Error("This receipt is already saved");
  }

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([receipt, ...existing])
  );
}

// Delete receipt
export async function deleteReceipt(id: string) {
  const existing = await getReceipts();

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing.filter((receipt) => receipt.id !== id))
  );
}
