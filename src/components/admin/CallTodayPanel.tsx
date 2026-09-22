import Icon from "@/components/ui/icon";
import { Contact, CityAd, FreeMonth, dueLabel, phoneDigits } from "./contactTypes";
import { MONTHS_RU } from "./mediaPlanTypes";

interface CallTodayPanelProps {
  due: Contact[];
  sleeping: Contact[];
  ads: CityAd[];
  freeMonths: FreeMonth[];
  onFocus: (industry: string) => void;
}

export default function CallTodayPanel({
  due,
  sleeping,
  ads,
  freeMonths,
  onFocus,
}: CallTodayPanelProps) {
  const lost = ads.filter(a => a.wasOurClient);
  const weakMonth = freeMonths.find(m => m.fillPct < 60);

  if (due.length === 0 && sleeping.length === 0 && lost.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
      {due.length > 0 && (
        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-2">
            <Icon name="PhoneCall" size={13} />
            Перезвонить ({due.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {due.slice(0, 12).map(c => {
              const d = dueLabel(c.nextTouchAt);
              return (
                <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-slate-700">{c.company}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className={d?.overdue ? "text-rose-600" : "text-slate-400"}>{d?.text}</span>
                    {c.phone && (
                      <a href={`tel:${phoneDigits(c.phone)}`} className="text-rose-600 hover:text-rose-700">
                        <Icon name="Phone" size={12} />
                      </a>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sleeping.length > 0 && (
        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
            <Icon name="Star" size={13} />
            Спящие клиенты ({sleeping.length})
          </div>
          <div className="text-[11px] text-emerald-700 mb-2">
            Уже размещались у вас, но сейчас не в работе
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {sleeping.slice(0, 12).map(c => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-slate-700">{c.company}</span>
                {c.phone && (
                  <a href={`tel:${phoneDigits(c.phone)}`} className="text-rose-600 shrink-0">
                    <Icon name="Phone" size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {lost.length > 0 && (
        <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 mb-2">
            <Icon name="TrendingDown" size={13} />
            Ушли к конкурентам ({lost.length})
          </div>
          <div className="text-[11px] text-rose-700 mb-2">
            Были вашими клиентами, сейчас висят на чужих экранах
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {lost.slice(0, 12).map((a, i) => (
              <div key={i} className="text-xs">
                <span className="text-slate-700 font-medium">{a.brand}</span>
                <span className="text-slate-400"> · {a.screen || a.address || "город"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weakMonth && (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-3 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1">
            <Icon name="MonitorPlay" size={13} />
            Экран недозагружен: {MONTHS_RU[weakMonth.month]} {weakMonth.year} заполнен на {weakMonth.fillPct}%
          </div>
          <div className="text-[11px] text-indigo-700 mb-2">
            Свободно {weakMonth.freeSec.toLocaleString("ru-RU")} секунд — есть что продавать. Кому звоним:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Авто", "Красота", "Спорт", "Маркетологи", "Байеры"].map(ind => (
              <button
                key={ind}
                onClick={() => onFocus(ind)}
                className="text-[11px] bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition"
              >
                База «{ind}»
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
