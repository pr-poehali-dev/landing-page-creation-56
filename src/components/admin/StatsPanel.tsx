import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";

interface StatsPanelProps {
  leads: Lead[];
}

interface MonthStat {
  key: string;
  label: string;
  leads: number;
  won: number;
  lost: number;
  revenue: number;
  avgCheck: number;
}

const MONTHS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function money(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function StatsPanel({ leads }: StatsPanelProps) {
  const [open, setOpen] = useState(false);

  const { months, total } = useMemo(() => {
    const map = new Map<string, MonthStat>();

    leads.forEach(l => {
      if (!l.createdAt) return;
      const key = monthKey(l.createdAt);
      if (!map.has(key)) {
        map.set(key, { key, label: monthLabel(key), leads: 0, won: 0, lost: 0, revenue: 0, avgCheck: 0 });
      }
      const m = map.get(key)!;
      m.leads += 1;
      if (l.status === "completed") m.won += 1;
      if (l.status === "lost") m.lost += 1;
      m.revenue += l.paidAmount || 0;
    });

    const list = [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
    list.forEach(m => {
      const payingDeals = leads.filter(
        l => l.createdAt && monthKey(l.createdAt) === m.key && (l.paidAmount || 0) > 0
      ).length;
      m.avgCheck = payingDeals > 0 ? Math.round(m.revenue / payingDeals) : 0;
    });

    const totalRevenue = leads.reduce((s, l) => s + (l.paidAmount || 0), 0);
    const paying = leads.filter(l => (l.paidAmount || 0) > 0).length;

    return {
      months: list,
      total: {
        leads: leads.length,
        won: leads.filter(l => l.status === "completed").length,
        lost: leads.filter(l => l.status === "lost").length,
        revenue: totalRevenue,
        avgCheck: paying > 0 ? Math.round(totalRevenue / paying) : 0,
      },
    };
  }, [leads]);

  if (leads.length === 0) return null;

  const maxLeads = Math.max(...months.map(m => m.leads), 1);
  const current = months[0];
  const conversion = total.leads > 0 ? Math.round((total.won / total.leads) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Icon name="ChartColumn" size={19} className="text-violet-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-base">Статистика</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {current
                ? `${current.label}: ${current.leads} заявок · получено ${money(current.revenue)} ₽`
                : "Данных пока нет"}
            </div>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-slate-400" />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Всего заявок", value: String(total.leads), icon: "Inbox", color: "text-slate-900" },
              { label: "Сделок закрыто", value: String(total.won), icon: "CircleCheck", color: "text-emerald-600" },
              { label: "Получено денег", value: `${money(total.revenue)} ₽`, icon: "Wallet", color: "text-slate-900" },
              { label: "Средний чек", value: `${money(total.avgCheck)} ₽`, icon: "Receipt", color: "text-slate-900" },
            ].map(c => (
              <div key={c.label} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name={c.icon} size={13} className="text-slate-400" />
                  {c.label}
                </div>
                <div className={`text-lg font-bold mt-1 ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 flex-wrap">
            <span>
              Доведено до конца:{" "}
              <span className="font-semibold text-slate-700">{conversion}%</span> заявок
            </span>
            {total.lost > 0 && (
              <span>
                Потеряно: <span className="font-semibold text-slate-700">{total.lost}</span>
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
            По месяцам
          </div>

          <div className="space-y-2">
            {months.map(m => (
              <div key={m.key} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-medium text-sm text-slate-900 capitalize">{m.label}</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {money(m.revenue)} ₽
                  </div>
                </div>

                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${(m.leads / maxLeads) * 100}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                  <span>заявок: <span className="font-medium text-slate-700">{m.leads}</span></span>
                  <span>закрыто: <span className="font-medium text-emerald-600">{m.won}</span></span>
                  {m.lost > 0 && (
                    <span>потеряно: <span className="font-medium text-slate-600">{m.lost}</span></span>
                  )}
                  {m.avgCheck > 0 && (
                    <span>средний чек: <span className="font-medium text-slate-700">{money(m.avgCheck)} ₽</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[11px] text-slate-400 leading-relaxed">
            «Получено денег» — фактически внесённые клиентами суммы, отмеченные в карточках.
            Средний чек считается по заявкам, где была хотя бы частичная оплата.
          </div>
        </div>
      )}
    </div>
  );
}
