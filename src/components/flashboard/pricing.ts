export const RATE = 325;
export const OUT = 204;
export const OTS = 33000;

export const DURATIONS = [5, 10, 15, 20];
export const MIN_DAYS = 5;
export const MAX_DAYS = 90;

export interface CalcResult {
  placement: number;
  cpt: number;
  outputs: number;
  contacts: number;
  total: number;
}

export function calcPlacement(dur: number, days: number): CalcResult {
  const k = dur > 15 ? 1.25 : 1;
  const placement = Math.round(RATE * dur * days * k);
  const cpt = placement / ((OTS * days) / 1000);
  const outputs = OUT * days;
  const contacts = Math.round((OTS * days) / 1000) * 1000;
  return { placement, cpt, outputs, contacts, total: placement };
}

export function plural(n: number, a: string, b: string, c: string) {
  const n100 = n % 100;
  if (n100 >= 11 && n100 <= 14) return c;
  const n10 = n % 10;
  if (n10 === 1) return a;
  if (n10 >= 2 && n10 <= 4) return b;
  return c;
}

export function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU") + " ₽";
}

export interface CalcPreset {
  duration: number;
  days: number;
  price: number;
  stamp: number;
}
