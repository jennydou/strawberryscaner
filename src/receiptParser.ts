import { Item, Receipt } from "./types";

const STORES: Record<string, string> = { RIMI: "Rimi", MAXIMA: "Maxima", LIDL: "Lidl" };

const TOTAL_WORDS = /KOP[AĀ]|KOKKU|SAMAKSAI/i;

const CATEGORIES: Record<string, string> = {
  "piens": "Pārtika",
  "maize": "Pārtika",
  "siers": "Pārtika",
  "mandarin": "Pārtika",
  "sula": "Dzērieni",
  "ūdens": "Dzērieni",
  "šokolāde": "Saldumi un uzkodas",
  "trauku": "Sadzīves preces",
  "ziepes": "Higiēna un kosmētika",
  "šampūns": "Higiēna un kosmētika",
};

const SKIP_WORDS = ["raha", "saldo", "netus", "teenitud", "sinu", "mans rimi", "pvn", "pvm", "karte"];

function findStore(text: string): string {
  const upper = text.toUpperCase();
  for (const key in STORES) {
    if (upper.includes(key)) return STORES[key];
  }
  return "";
}

function findDate(text: string): string {
  const m = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return "";
}

function toNumber(s: string): number {
  return parseFloat(s.replace(",", ".").replace("€", "").trim());
}

function findTotal(lines: string[]): number {
  const line = lines.find(l => TOTAL_WORDS.test(l));
  if (!line) return 0;
  const m = line.match(/(\d+[.,]\d{2})/);
  if (!m) return 0;
  return toNumber(m[1]);
}

function findCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const word in CATEGORIES) {
    if (lower.includes(word)) return CATEGORIES[word];
  }
  return "Cits";
}

function shouldSkip(line: string): boolean {
  const lower = line.toLowerCase();
  for (const word of SKIP_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

function findItems(lines: string[]): Item[] {
  const items: Item[] = [];
  let lastName = "";

  for (const line of lines) {
    if (TOTAL_WORDS.test(line)) break;
    if (shouldSkip(line)) continue;

    const m = line.match(/^(.+?)\s+(-?\d+[.,]\d{2})\s*[A-Z]?$/);
    if (!m) {
      if (lastName && /^[a-zāčēģīķļņšūž]/.test(line)) {
        lastName = lastName + " " + line;
      } else {
        lastName = line;
      }
      continue;
    }

    const name = m[1];
    const price = toNumber(m[2]);
    const lower = name.toLowerCase();

    if (lower.includes(" x ")) {
      const quantity = toNumber(lower.split(" x ")[0]);
      items.push({ name: lastName, quantity: quantity, price: price, category: findCategory(lastName) });
    } else {
      items.push({ name: name, quantity: 1, price: price, category: findCategory(name) });
    }
  }
  return items;
}

function checkSum(items: Item[], total: number): string | null {
  if (total === 0) return "Kopsumma nav atrasta";
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  sum = Math.round(sum * 100) / 100;
  if (sum === total) return null;
  return "Summas nesakrīt";
}

export function parseReceipt(text: string): Receipt {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l && l.length <= 200);
  const items = findItems(lines);
  const total = findTotal(lines);

  return {
    store: findStore(text),
    date: findDate(text),
    total: total,
    items: items,
    warning: checkSum(items, total),
  };
}