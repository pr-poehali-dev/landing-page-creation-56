import { useState, useEffect, useCallback } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import ScreenRoute from "./ScreenRoute";
import WatchSources from "./WatchSources";
import { MonitoringData } from "./monitoringTypes";

interface MonitoringPanelProps {
  adminKey: string;
  onDataChanged?: () => void;
}

export default function MonitoringPanel({ adminKey, onDataChanged }: MonitoringPanelProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(func2url.monitoring, { headers: { "X-Admin-Key": adminKey } });
      if (!res.ok) throw new Error("Не удалось загрузить мониторинг");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch(func2url.monitoring, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Действие не выполнено");
      return json;
    },
    [adminKey]
  );

  async function run(payload: Record<string, unknown>, message?: (r: Record<string, unknown>) => string) {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const json = await post(payload);
      if (message) setInfo(message(json));
      await load();
      onDataChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  const overdue = data?.overdueCount || 0;
  const unread = data?.unreadCount || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <Icon name="Radar" size={19} className="text-sky-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-base flex items-center gap-1.5">
              Мониторинг конкурентов
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Объезд экранов, сайты клиентов и тендеры
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {overdue > 0 && (
            <span className="text-[11px] bg-amber-100 text-amber-800 rounded-full px-2.5 py-1 font-medium">
              {overdue} точек пора проверить
            </span>
          )}
          {unread > 0 && (
            <span className="text-[11px] bg-rose-600 text-white rounded-full px-2.5 py-1 font-medium">
              {unread} сигналов
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs mb-3">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 text-xs mb-3">
              {info}
            </div>
          )}

          {loading && !data && (
            <div className="text-sm text-slate-400 py-6 text-center">Загружаем…</div>
          )}

          {data && (
            <>
              <ScreenRoute
                points={data.points}
                onCheck={(pointId, brand) => run({ action: "checkPoint", pointId, brand })}
                onAdd={payload => run({ action: "addPoint", ...payload })}
                onDelete={pointId => run({ action: "deletePoint", pointId })}
              />

              <WatchSources
                sources={data.sources}
                signals={data.signals}
                busy={busy}
                onAddSource={payload => run({ action: "addSource", ...payload })}
                onDeleteSource={sourceId => run({ action: "deleteSource", sourceId })}
                onCheckSources={() =>
                  run({ action: "checkSources", limit: 4 }, r => {
                    const checked = (r.checked as { status: string }[]) || [];
                    const changed = checked.filter(c => c.status === "changed").length;
                    return changed > 0
                      ? `Проверено сайтов: ${checked.length}, изменений: ${changed}`
                      : `Проверено сайтов: ${checked.length}, изменений нет`;
                  })
                }
                onSearchTenders={query =>
                  run({ action: "searchTenders", query }, r =>
                    (r.found as number) > 0
                      ? `Найдено новых закупок: ${r.found}`
                      : "Новых закупок по этому запросу нет"
                  )
                }
                onReadSignal={signalId => run({ action: "readSignal", signalId })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
