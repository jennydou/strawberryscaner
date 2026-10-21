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

const CATEGORIES: Record<string, string> = {
  "piens": "Pārtika",
  "maize": "Pārtika",
  "siers": "Pārtika",
  "sula": "Dzērieni",
  "ūdens": "Dzērieni",
  "šokolāde": "Saldumi un uzkodas",
  "trauku": "Sadzīves preces",
  "ziepes": "Higiēna un kosmētika",
  "šampūns": "Higiēna un kosmētika",
};

function findCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const word in CATEGORIES) {
    if (lower.includes(word)) return CATEGORIES[word];
  }
  return "Cits";
}

function findItems(lines: string[]): Item[] {
  const items: Item[] = [];
  let lastName = "";

  for (const line of lines) {
    if (/KOP[AĀ]|KOKKU/i.test(line)) break;

    const m = line.match(/^(.+?)\s+(-?\d+[.,]\d{2})\s*[A-Z]?$/);
    if (!m) {
      lastName = line; // no price, so this may be the name for the next line
      continue;
    }

    const name = m[1];
    const price = toNumber(m[2]);

    if (name.includes(" x ")) {
      // a quantity line like "2 x 2,41": the name is on the line above
      const quantity = toNumber(name.split(" x ")[0]);
      items.push({ name: lastName, quantity: quantity, price: price, category: findCategory(lastName) });
    } else {
      items.push({ name: name, quantity: 1, price: price, category: findCategory(name) });
    }
  }
  return items;
}