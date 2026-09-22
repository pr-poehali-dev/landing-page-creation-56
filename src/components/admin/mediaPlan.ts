import { Lead } from "./adminTypes";

export const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const OUTPUTS_PER_DAY = 204;

export const PLAN_STATUSES = ["contract", "payment", "live", "completed"];

export interface PlanRow {
  leadId: number;
  client: string;
  phone: string;
  status: string;
  duration: number;
  startDate: string;
  endDate: string;
  daysTotal: number;
  daysInMonth: number;
  firstDay: number;
  lastDay: number;
  amountTotal: number;
  amountInMonth: number;
  outputs: number;
  paid: boolean;
}

export interface MonthKey {
  year: number;
  month: number;
}

function parseIso(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export function monthLabel(m: MonthKey): string {
  return `${MONTHS_RU[m.month]} ${m.year}`;
}

export function daysInMonth(m: MonthKey): number {
  return new Date(m.year, m.month + 1, 0).getDate();
}

export function shiftMonth(m: MonthKey, delta: number): MonthKey {
  const d = new Date(m.year, m.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function currentMonth(): MonthKey {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function planLeads(leads: Lead[]): Lead[] {
  return leads.filter(l => l.startDate && l.endDate && PLAN_STATUSES.includes(l.status));
}

export function monthsWithPlacements(leads: Lead[]): MonthKey[] {
  const keys = new Set<string>();
  planLeads(leads).forEach(l => {
    const s = parseIso(l.startDate);
    const e = parseIso(l.endDate);
    if (!s || !e) return;
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    while (cur <= e) {
      keys.add(`${cur.getFullYear()}-${cur.getMonth()}`);
      cur.setMonth(cur.getMonth() + 1);
    }
  });
  return Array.from(keys)
    .map(k => {
      const [y, m] = k.split("-").map(Number);
      return { year: y, month: m };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

export function buildMonthPlan(leads: Lead[], m: MonthKey): PlanRow[] {
  const monthStart = new Date(m.year, m.month, 1);
  const monthEnd = new Date(m.year, m.month + 1, 0);

  const rows: PlanRow[] = [];
  planLeads(leads).forEach(l => {
    const s = parseIso(l.startDate);
    const e = parseIso(l.endDate);
    if (!s || !e) return;
    if (e < monthStart || s > monthEnd) return;

    const from = s > monthStart ? s : monthStart;
    const to = e < monthEnd ? e : monthEnd;
    const daysInM = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    const daysTotal = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    const amountTotal = l.placementAmount ?? l.totalPrice ?? 0;

    rows.push({
      leadId: l.id,
      client: l.company || l.name,
      phone: l.phone,
      status: l.status,
      duration: l.duration || 0,
      startDate: l.startDate || "",
      endDate: l.endDate || "",
      daysTotal,
      daysInMonth: daysInM,
      firstDay: from.getDate(),
      lastDay: to.getDate(),
      amountTotal,
      amountInMonth: daysTotal > 0 ? Math.round((amountTotal / daysTotal) * daysInM) : 0,
      outputs: daysInM * OUTPUTS_PER_DAY,
      paid: (l.totalPrice || 0) > 0 && l.paidAmount >= (l.totalPrice || 0),
    });
  });

  return rows.sort((a, b) => a.firstDay - b.firstDay || a.client.localeCompare(b.client));
}

export interface ClientPlan {
  leadId: number;
  client: string;
  status: string;
  duration: number;
  startDate: string;
  endDate: string;
  daysTotal: number;
  amountTotal: number;
  outputs: number;
  months: { key: MonthKey; days: number; amount: number }[];
}

export function buildClientPlan(leads: Lead[]): ClientPlan[] {
  return planLeads(leads)
    .map(l => {
      const s = parseIso(l.startDate)!;
      const e = parseIso(l.endDate)!;
      const daysTotal = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
      const amountTotal = l.placementAmount ?? l.totalPrice ?? 0;

      const months: ClientPlan["months"] = [];
      const cur = new Date(s.getFullYear(), s.getMonth(), 1);
      while (cur <= e) {
        const key = { year: cur.getFullYear(), month: cur.getMonth() };
        const mStart = new Date(key.year, key.month, 1);
        const mEnd = new Date(key.year, key.month + 1, 0);
        const from = s > mStart ? s : mStart;
        const to = e < mEnd ? e : mEnd;
        const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
        months.push({
          key,
          days,
          amount: daysTotal > 0 ? Math.round((amountTotal / daysTotal) * days) : 0,
        });
        cur.setMonth(cur.getMonth() + 1);
      }

      return {
        leadId: l.id,
        client: l.company || l.name,
        status: l.status,
        duration: l.duration || 0,
        startDate: l.startDate || "",
        endDate: l.endDate || "",
        daysTotal,
        amountTotal,
        outputs: daysTotal * OUTPUTS_PER_DAY,
        months,
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function fmtShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
