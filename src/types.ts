export type Item = { name: string; quantity: number; price: number; category: string };
export type Receipt = { store: string; date: string; total: number; items: Item[]; warning: string | null };