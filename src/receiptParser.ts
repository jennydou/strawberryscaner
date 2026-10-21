import { Item, Receipt } from "./types";

const STORES: Record<string, string> = { RIMI: "Rimi", MAXIMA: "Maxima", LIDL: "Lidl" };

function findStore(text: string): string {
  const upper = text.toUpperCase();
  for (const key in STORES) {
    if (upper.includes(key)) return STORES[key];
  }
  return "";
}

export function parseReceipt(text: string): Receipt {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  return { store: findStore(text), date: findDate(text), total: findTotal(lines), items: findItems(lines), warning: null };
}
function findDate(text: string): string {
  const m = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}
function toNumber(s: string): number {
  return parseFloat(s.replace(",", ".").replace("€", "").trim());
}

function findTotal(lines: string[]): number {
  const line = lines.find(l => /KOP[AĀ]|KOKKU/i.test(l));
  if (!line) return 0;
  const m = line.match(/(\d+[.,]\d{2})/);
  return m ? toNumber(m[1]) : 0;
}

function findItems(lines: string[]): Item[] {
  const items: Item[] = [];
  for (const line of lines) {
    if (/KOP[AĀ]|KOKKU/i.test(line)) break;
    const m = line.match(/^(.+?)\s+(-?\d+[.,]\d{2})\s*[A-Z]?$/);
    if (!m) continue;
    items.push({ name: m[1], quantity: 1, price: toNumber(m[2]), category: "Cits" });
  }
  return items;
}