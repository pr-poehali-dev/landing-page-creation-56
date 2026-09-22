export interface ScreenPoint {
  id: number;
  screenType: string;
  address: string;
  operator: string | null;
  note: string | null;
  checkDays: number;
  lastCheckedAt: string | null;
  daysAgo: number | null;
  overdue: boolean;
}

export interface WatchSource {
  id: number;
  title: string;
  url: string;
  kind: string;
  keywords: string | null;
  lastCheckedAt: string | null;
  lastStatus: string | null;
  changedAt: string | null;
}

export interface WatchSignal {
  id: number;
  type: string;
  title: string;
  details: string | null;
  url: string | null;
  amount: number | null;
  isRead: boolean;
  createdAt: string | null;
}

export interface MonitoringData {
  points: ScreenPoint[];
  sources: WatchSource[];
  signals: WatchSignal[];
  overdueCount: number;
  unreadCount: number;
}

export const SIGNAL_META: Record<string, { icon: string; color: string; label: string }> = {
  site_change: { icon: "Globe", color: "bg-sky-50 text-sky-600", label: "Сайт обновился" },
  tender: { icon: "Gavel", color: "bg-violet-50 text-violet-600", label: "Тендер" },
  change: { icon: "Bell", color: "bg-slate-100 text-slate-600", label: "Сигнал" },
};

export const TENDER_QUERIES = [
  "светодиодный экран реклама",
  "услуги наружной рекламы",
  "размещение видеоролика экран",
  "медиафасад размещение",
];

export function agoText(iso: string | null): string {
  if (!iso) return "ещё не проверяли";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 30) return `${days} дн. назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
