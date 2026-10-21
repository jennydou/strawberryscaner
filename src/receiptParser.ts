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

  return { store: findStore(text), date: findDate(text), total: findTotal(lines), items: [], warning: null };
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