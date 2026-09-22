export const MONTHS_RU = [
  "", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const PAY_LABELS: Record<string, string> = {
  paid: "Оплачено",
  unpaid: "Не оплачено",
  barter: "Бартер",
  social: "Социальная",
  promo: "Промо",
  unknown: "Не указано",
};

export const PAY_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-rose-100 text-rose-700",
  barter: "bg-amber-100 text-amber-700",
  social: "bg-sky-100 text-sky-700",
  promo: "bg-violet-100 text-violet-700",
  unknown: "bg-slate-100 text-slate-600",
};

export const VIDEO_LABELS: Record<string, string> = {
  ready: "Присутствует",
  production: "В изготовлении",
  unknown: "Не указано",
};

export interface Placement {
  id: number;
  leadId: number | null;
  year: number;
  month: number;
  rowNo: number | null;
  brand: string;
  legalEntity: string | null;
  agency: string | null;
  paymentType: string;
  videoStatus: string;
  durationSec: number;
  periodText: string | null;
  startDay: number | null;
  endDay: number | null;
  daysCount: number;
  amountMonth: number;
  daySeconds: number[];
  discount: number;
  priceTotal: number;
}

export interface PlanPeriod {
  year: number;
  month: number;
}

export interface PlanTotal extends PlanPeriod {
  amount: number;
  count: number;
}

export interface RevenueFact extends PlanPeriod {
  amount: number;
}

export interface MediaPlanData {
  year: number;
  month: number;
  daysInMonth: number;
  capacity: number;
  screenName: string;
  items: Placement[];
  load: number[];
  periods: PlanPeriod[];
  planTotals: PlanTotal[];
  revenue: RevenueFact[];
}

export function money(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

export function monthTitle(p: PlanPeriod): string {
  return `${MONTHS_RU[p.month]} ${p.year}`;
}
