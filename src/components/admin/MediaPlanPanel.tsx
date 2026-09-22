import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Lead, STATUS_LABELS, STATUS_COLORS } from "./adminTypes";
import {
  MonthKey,
  buildMonthPlan,
  buildClientPlan,
  currentMonth,
  daysInMonth,
  fmtShort,
  monthLabel,
  monthsWithPlacements,
  planLeads,
  shiftMonth,
} from "./mediaPlan";

interface MediaPlanPanelProps {
  leads: Lead[];
}

function money(n: number) {
  return n.toLocaleString("ru-RU");
}

export default function MediaPlanPanel({ leads }: MediaPlanPanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"month" | "client">("month");
  const [month, setMonth] = useState<MonthKey>(currentMonth());

  const available = useMemo(() => monthsWithPlacements(leads), [leads]);
  const rows = useMemo(() => buildMonthPlan(leads, month), [leads, month]);
  const clients = useMemo(() => buildClientPlan(leads), [leads]);
  const total = planLeads(leads).length;

  if (total === 0) return null;

  const dim = daysInMonth(month);
  const monthAmount = rows.reduce((s, r) => s + r.amountInMonth, 0);
  const monthDays = rows.reduce((s, r) => s + r.daysInMonth, 0);
  const monthOutputs = rows.reduce((s, r) => s + r.outputs, 0);

  function printPlan() {
    document.body.classList.add("printing-plan");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-plan"), 500);
  }

  return (
    <div className="media-plan-print bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 print:border-0 print:shadow-none">
      <div className="p-5 flex items-center justify-between gap-3 flex-wrap print:hidden">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Icon name="CalendarRange" size={19} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-base flex items-center gap-1.5">
              Медиаплан размещений
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {total} размещений в работе · по месяцам и по клиентам
            </div>
          </div>
        </button>

        {open && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setMode("month")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${mode === "month" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                По месяцам
              </button>
              <button
                onClick={() => setMode("client")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${mode === "client" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                По клиентам
              </button>
            </div>
            <button
              onClick={printPlan}
              title="Распечатать или сохранить в PDF"
              className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2"
            >
              <Icon name="Printer" size={14} />
              Печать
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="px-5 pb-5">
          <div className="hidden print:block mb-3">
            <div className="text-base font-bold text-slate-900">Медиаплан размещений</div>
            <div className="text-xs text-slate-500">
              {mode === "month" ? monthLabel(month) : "Сводка по клиентам"} · светодиодный экран, Океанский пр-т, 16А
            </div>
          </div>
          {mode === "month" ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMonth(m => shiftMonth(m, -1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition print:hidden"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </button>
                  <div className="text-sm font-semibold text-slate-900 min-w-[140px] text-center">
                    {monthLabel(month)}
                  </div>
                  <button
                    onClick={() => setMonth(m => shiftMonth(m, 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition print:hidden"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
                {available.length > 0 && (
                  <div className="flex flex-wrap gap-1 print:hidden">
                    {available.map(m => (
                      <button
                        key={`${m.year}-${m.month}`}
                        onClick={() => setMonth(m)}
                        className={`text-[11px] rounded-full px-2.5 py-1 transition ${
                          m.year === month.year && m.month === month.month
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {monthLabel(m)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {rows.length === 0 ? (
                <div className="text-sm text-slate-400 py-6 text-center">
                  В {monthLabel(month).toLowerCase()} размещений нет
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="text-left font-medium py-2 pr-3 min-w-[150px]">Клиент</th>
                          <th className="text-left font-medium py-2 pr-3 whitespace-nowrap">Период</th>
                          <th className="text-center font-medium py-2 px-2">Дней</th>
                          <th className="text-center font-medium py-2 px-2">Хрон.</th>
                          <th className="text-right font-medium py-2 px-2 whitespace-nowrap">Выходов</th>
                          <th className="text-right font-medium py-2 pl-2 whitespace-nowrap">Сумма мес., ₽</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.leadId} className="border-t border-slate-100">
                            <td className="py-2 pr-3">
                              <div className="font-medium text-slate-900 truncate max-w-[220px]">{r.client}</div>
                              <span
                                className={`inline-block mt-0.5 text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-600"}`}
                              >
                                {STATUS_LABELS[r.status] || r.status}
                              </span>
                            </td>
                            <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">
                              {fmtShort(r.startDate)} — {fmtShort(r.endDate)}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-700">
                              {r.daysInMonth}
                              {r.daysInMonth !== r.daysTotal && (
                                <span className="text-slate-400"> / {r.daysTotal}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600">{r.duration ? `${r.duration}″` : "—"}</td>
                            <td className="py-2 px-2 text-right text-slate-600">{money(r.outputs)}</td>
                            <td className="py-2 pl-2 text-right font-semibold text-slate-900 whitespace-nowrap">
                              {money(r.amountInMonth)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 font-semibold text-slate-900">
                          <td className="py-2 pr-3">Итого за месяц</td>
                          <td className="py-2 pr-3 text-slate-500 font-normal">{rows.length} размещений</td>
                          <td className="py-2 px-2 text-center">{monthDays}</td>
                          <td className="py-2 px-2" />
                          <td className="py-2 px-2 text-right">{money(monthOutputs)}</td>
                          <td className="py-2 pl-2 text-right">{money(monthAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-4 border border-slate-200 rounded-xl p-3 overflow-x-auto">
                    <div className="text-[11px] text-slate-500 mb-2">Загрузка экрана по дням</div>
                    <div className="space-y-1.5 min-w-[560px]">
                      <div className="flex gap-[2px] pl-[150px]">
                        {Array.from({ length: dim }, (_, i) => (
                          <div key={i} className="flex-1 text-center text-[9px] text-slate-400">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {rows.map(r => (
                        <div key={r.leadId} className="flex items-center gap-[2px]">
                          <div className="w-[150px] shrink-0 pr-2 text-[11px] text-slate-600 truncate">
                            {r.client}
                          </div>
                          {Array.from({ length: dim }, (_, i) => {
                            const day = i + 1;
                            const active = day >= r.firstDay && day <= r.lastDay;
                            return (
                              <div
                                key={i}
                                title={active ? `${r.client}: ${day} ${monthLabel(month).toLowerCase()}` : ""}
                                className={`flex-1 h-4 rounded-[3px] ${
                                  active ? (r.paid ? "bg-emerald-500" : "bg-indigo-400") : "bg-slate-100"
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-[3px] bg-emerald-500 inline-block" /> оплачено
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-[3px] bg-indigo-400 inline-block" /> ждёт оплаты
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {clients.map(c => (
                <div key={c.leadId} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">{c.client}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {fmtShort(c.startDate)} — {fmtShort(c.endDate)} · {c.daysTotal} дн.
                        {c.duration > 0 && ` · ${c.duration}″`} · {money(c.outputs)} выходов
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 text-sm">{money(c.amountTotal)} ₽</div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.months.map(m => (
                      <span
                        key={`${m.key.year}-${m.key.month}`}
                        className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2.5 py-1"
                      >
                        {monthLabel(m.key)}: {m.days} дн. · {money(m.amount)} ₽
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2 border-t border-slate-200">
                <span>Итого по всем клиентам</span>
                <span>{money(clients.reduce((s, c) => s + c.amountTotal, 0))} ₽</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
