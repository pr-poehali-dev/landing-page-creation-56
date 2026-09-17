const MS_DAY = 86400000;

function parse(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(startIso: string, endIso: string): number | null {
  const s = parse(startIso);
  const e = parse(endIso);
  if (!s || !e) return null;
  const diff = Math.round((e.getTime() - s.getTime()) / MS_DAY) + 1;
  return diff > 0 ? diff : null;
}

export function endFromStart(startIso: string, days: number): string {
  const s = parse(startIso);
  if (!s || days < 1) return "";
  return toIso(new Date(s.getTime() + (days - 1) * MS_DAY));
}

export interface PeriodFields {
  startDate: string;
  endDate: string;
  days: string;
}

export function syncPeriod(
  prev: PeriodFields,
  changed: "startDate" | "endDate" | "days",
  value: string
): PeriodFields {
  const next: PeriodFields = { ...prev, [changed]: value };
  const daysNum = Number(next.days) || 0;

  if (changed === "days") {
    if (next.startDate && daysNum > 0) {
      next.endDate = endFromStart(next.startDate, daysNum);
    } else if (!daysNum) {
      next.endDate = prev.endDate;
    }
    return next;
  }

  if (changed === "startDate") {
    if (!next.startDate) return next;
    if (daysNum > 0) {
      next.endDate = endFromStart(next.startDate, daysNum);
      return next;
    }
    const d = daysBetween(next.startDate, next.endDate);
    if (d) next.days = String(d);
    return next;
  }

  if (!next.endDate) return next;
  if (next.startDate) {
    const d = daysBetween(next.startDate, next.endDate);
    next.days = d ? String(d) : "";
  }
  return next;
}

export function periodConflict(f: PeriodFields): string | null {
  const daysNum = Number(f.days) || 0;
  if (!f.startDate || !f.endDate) return null;
  const real = daysBetween(f.startDate, f.endDate);
  if (real === null) return "Дата окончания раньше даты начала";
  if (daysNum > 0 && real !== daysNum) {
    return `По датам получается ${real} дн., а указано ${daysNum} дн.`;
  }
  return null;
}