import { useState, useEffect, useCallback } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import PlanTable from "./PlanTable";
import PlanLoadGrid from "./PlanLoadGrid";
import RevenueSummary from "./RevenueSummary";
import { MediaPlanData, money, monthTitle } from "./mediaPlanTypes";

interface MediaPlanPanelProps {
  token: string;
}

export default function MediaPlanPanel({ token }: MediaPlanPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"plan" | "revenue">("plan");
  const [data, setData] = useState<MediaPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const now = new Date();
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });

  const load = useCallback(
    async (year: number, month: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${func2url.mediaplan}?year=${year}&month=${month}`, {
          headers: { "X-Session-Token": token },
        });
        if (!res.ok) throw new Error("Не удалось загрузить медиаплан");
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (open) load(period.year, period.month);
  }, [open, period, load]);

  async function runImport(syncLeads = false) {
    setImporting(true);
    setError("");
    try {
      const res = await fetch(func2url["import-plan"], {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify(syncLeads ? { syncLeads: true } : {}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Импорт не удался (код ${res.status})`);
      if (json.skipped) {
        setError(`Данные уже перенесены ранее: ${json.existing} размещений`);
      }
      if (json.syncedLeads !== undefined) {
        setError(json.syncedLeads > 0
          ? `Синхронизировано сделок: ${json.syncedLeads}`
          : "Нет сделок со статусом «Договор» и позже с заполненными датами");
      }
      await load(period.year, period.month);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка импорта");
    } finally {
      setImporting(false);
    }
  }

  async function exportExcel(onlyMonth: boolean) {
    setExporting(true);
    setError("");
    try {
      const res = await fetch(func2url["plan-export"], {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify(onlyMonth ? period : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Не удалось выгрузить файл");
      window.open(json.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка выгрузки");
    } finally {
      setExporting(false);
    }
  }

  function shift(delta: number) {
    const d = new Date(period.year, period.month - 1 + delta, 1);
    setPeriod({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const monthAmount = data ? data.items.reduce((s, i) => s + i.amountMonth, 0) : 0;
  const hasData = data && data.periods.length > 0;

  return (
    <div className="media-plan-print bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
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
              Загрузка экрана по секундам, ролики по месяцам и сводка выручки
            </div>
          </div>
        </button>

        {open && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setTab("plan")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${tab === "plan" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                Медиаплан
              </button>
              <button
                onClick={() => setTab("revenue")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${tab === "revenue" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                Выручка
              </button>
            </div>
            <button
              onClick={() => runImport(true)}
              disabled={importing}
              title="Подтянуть в медиаплан сделки из заявок"
              className="text-xs text-slate-500 hover:text-indigo-700 transition flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2 disabled:opacity-50"
            >
              <Icon name="RefreshCw" size={14} />
              {importing ? "Обновляем…" : "Из сделок"}
            </button>
            <button
              onClick={() => exportExcel(false)}
              disabled={exporting}
              className="text-xs text-slate-500 hover:text-emerald-700 transition flex items-center gap-1 border border-slate-200 rounded-lg px-3 py-2 disabled:opacity-50"
            >
              <Icon name="FileSpreadsheet" size={14} />
              {exporting ? "Готовим…" : "Excel"}
            </button>
            <button
              onClick={() => {
                document.body.classList.add("printing-plan");
                window.print();
                setTimeout(() => document.body.classList.remove("printing-plan"), 500);
              }}
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
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs mb-3">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-slate-400 py-6 text-center">Загружаем медиаплан…</div>}

          {!loading && !hasData && (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <Icon name="FileSpreadsheet" size={32} className="mx-auto text-slate-300 mb-2" />
              <div className="text-sm text-slate-600 font-medium">Медиаплан ещё не заполнен</div>
              <div className="text-xs text-slate-500 mt-1 mb-3">
                Можно перенести данные из вашего Excel-файла за 2026 год одним нажатием
              </div>
              <button
                onClick={() => runImport(false)}
                disabled={importing}
                className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition disabled:opacity-50"
              >
                {importing ? "Переносим…" : "Перенести данные из файла"}
              </button>
            </div>
          )}

          {!loading && hasData && tab === "plan" && (
            <>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => shift(-1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition print:hidden"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </button>
                  <div className="text-sm font-semibold text-slate-900 min-w-[150px] text-center">
                    {monthTitle(period)}
                  </div>
                  <button
                    onClick={() => shift(1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition print:hidden"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  {data!.items.length} роликов · выручка месяца{" "}
                  <b className="text-slate-900">{money(monthAmount)} ₽</b>
                </div>
                <div className="flex flex-wrap gap-1 print:hidden">
                  {data!.periods.map(p => (
                    <button
                      key={`${p.year}-${p.month}`}
                      onClick={() => setPeriod(p)}
                      className={`text-[11px] rounded-full px-2.5 py-1 transition ${
                        p.year === period.year && p.month === period.month
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {monthTitle(p)}
                    </button>
                  ))}
                </div>
              </div>

              {data!.items.length === 0 ? (
                <div className="text-sm text-slate-400 py-6 text-center">
                  В {monthTitle(period).toLowerCase()} размещений нет
                </div>
              ) : (
                <div className="space-y-4">
                  <PlanLoadGrid
                    items={data!.items}
                    load={data!.load}
                    capacity={data!.capacity}
                    daysInMonth={data!.daysInMonth}
                  />
                  <PlanTable
                    items={data!.items}
                    daysInMonth={data!.daysInMonth}
                    capacity={data!.capacity}
                    load={data!.load}
                  />
                </div>
              )}
            </>
          )}

          {!loading && hasData && tab === "revenue" && (
            <RevenueSummary revenue={data!.revenue} planTotals={data!.planTotals} />
          )}
        </div>
      )}
    </div>
  );
}
