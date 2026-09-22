export interface Contact {
  id: number;
  company: string;
  industry: string | null;
  category: string | null;
  profile: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  site: string | null;
  note: string | null;
  source: string | null;
  channel: string | null;
  funnelStatus: string;
  priceSent: boolean;
  wasClient: boolean;
  leadId: number | null;
  lastTouchAt: string | null;
  nextTouchAt: string | null;
  touchCount: number;
  lastResult: string | null;
}

export interface CityAd {
  brand: string;
  screen: string | null;
  address: string | null;
  seen: string | null;
  source: string | null;
  company: string | null;
  wasOurClient: boolean;
}

export interface FreeMonth {
  year: number;
  month: number;
  freeSec: number;
  fillPct: number;
}

export interface ContactsData {
  items: Contact[];
  industries: { name: string; count: number }[];
  statuses: Record<string, number>;
  due: Contact[];
  sleeping: Contact[];
  ads: CityAd[];
  total: number;
}

export const FUNNEL_LABELS: Record<string, string> = {
  new: "Не обработан",
  contacted: "Связались",
  price_sent: "Выслан прайс",
  negotiation: "Переговоры",
  won: "Стал клиентом",
  refused: "Отказ",
  sleeping: "Спящий",
};

export const FUNNEL_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-sky-100 text-sky-700",
  price_sent: "bg-violet-100 text-violet-700",
  negotiation: "bg-amber-100 text-amber-700",
  won: "bg-emerald-100 text-emerald-700",
  refused: "bg-rose-100 text-rose-700",
  sleeping: "bg-slate-200 text-slate-600",
};

export const FUNNEL_ORDER = [
  "new", "contacted", "price_sent", "negotiation", "won", "refused", "sleeping",
];

export const RESULT_OPTIONS = [
  { value: "no_answer", label: "Не дозвонился", next: 3, status: "contacted" },
  { value: "interested", label: "Заинтересован", next: 7, status: "negotiation" },
  { value: "price_sent", label: "Выслал прайс", next: 5, status: "price_sent" },
  { value: "think", label: "Думают", next: 14, status: "negotiation" },
  { value: "later", label: "Перезвонить позже", next: 30, status: "contacted" },
  { value: "refused", label: "Отказ", next: 0, status: "refused" },
];

export function phoneDigits(phone: string | null): string {
  return (phone || "").replace(/\D/g, "");
}

export function formatTouch(iso: string | null): string {
  if (!iso) return "нет касаний";
  const d = new Date(iso);
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 30) return `${days} дн. назад`;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function dueLabel(iso: string | null): { text: string; overdue: boolean } | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${iso}T00:00:00`);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { text: `просрочен на ${Math.abs(days)} дн.`, overdue: true };
  if (days === 0) return { text: "сегодня", overdue: true };
  return { text: `через ${days} дн.`, overdue: false };
}
