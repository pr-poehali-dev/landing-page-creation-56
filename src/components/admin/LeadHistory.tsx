import { useState } from "react";
import Icon from "@/components/ui/icon";
import { LeadEvent } from "./adminTypes";

interface LeadHistoryProps {
  events: LeadEvent[];
}

const EVENT_META: Record<string, { icon: string; color: string; title: string }> = {
  created: { icon: "Inbox", color: "bg-slate-100 text-slate-500", title: "Заявка создана" },
  status: { icon: "ArrowRightLeft", color: "bg-blue-50 text-blue-600", title: "Статус изменён" },
  document: { icon: "FileText", color: "bg-purple-50 text-purple-600", title: "Документ сформирован" },
  payment: { icon: "Wallet", color: "bg-emerald-50 text-emerald-600", title: "Оплата" },
  requisites: { icon: "Building2", color: "bg-slate-100 text-slate-500", title: "Реквизиты" },
  terms: { icon: "CalendarRange", color: "bg-amber-50 text-amber-600", title: "Условия" },
};

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `сегодня в ${time}`;
  if (yesterday) return `вчера в ${time}`;
  return `${d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })} в ${time}`;
}

const PREVIEW = 3;

export default function LeadHistory({ events }: LeadHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (!events || events.length === 0) return null;

  const shown = expanded ? events : events.slice(0, PREVIEW);
  const hidden = events.length - shown.length;

  return (
    <div className="mt-3 bg-slate-50 rounded-lg p-3">
      <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
        <Icon name="History" size={13} className="text-slate-400" />
        История
      </div>

      <div className="space-y-2">
        {shown.map((e, i) => {
          const meta = EVENT_META[e.type] || {
            icon: "Circle",
            color: "bg-slate-100 text-slate-500",
            title: e.type,
          };
          return (
            <div key={`${e.createdAt}-${i}`} className="flex items-start gap-2.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                <Icon name={meta.icon} size={12} />
              </div>
              <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs text-slate-700">{e.details || meta.title}</span>
                <span className="text-[11px] text-slate-400">{formatWhen(e.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {events.length > PREVIEW && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
        >
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={12} />
          {expanded ? "Свернуть историю" : `Показать ещё ${hidden}`}
        </button>
      )}
    </div>
  );
}
