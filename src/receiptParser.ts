import { Item, Receipt } from "./types";

export function parseReceipt(text: string): Receipt {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  return { store: "", date: "", total: 0, items: [], warning: null };
}