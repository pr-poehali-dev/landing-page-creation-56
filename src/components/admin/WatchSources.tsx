import { useState } from "react";
import Icon from "@/components/ui/icon";
import { WatchSource, WatchSignal, SIGNAL_META, TENDER_QUERIES, agoText } from "./monitoringTypes";

interface WatchSourcesProps {
  sources: WatchSource[];
  signals: WatchSignal[];
  onAddSource: (payload: Record<string, unknown>) => Promise<void>;
  onDeleteSource: (id: number) => Promise<void>;
  onCheckSources: () => Promise<void>;
  onSearchTenders: (query: string) => Promise<void>;
  onReadSignal: (id: number) => Promise<void>;
  busy: boolean;
}

export default function WatchSources({
  sources,
  signals,
  onAddSource,
  onDeleteSource,
  onCheckSources,
  onSearchTenders,
  onReadSignal,
  busy,
}: WatchSourcesProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", keywords: "" });

  const unread = signals.filter(s => !s.isRead);

  async function save() {
    if (!form.title.trim() || !form.url.trim()) return;
    await onAddSource(form);
    setForm({ title: "", url: "", keywords: "" });
    setAdding(false);
  }

  return (
    <>
      <div className="border border-slate-200 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
            <Icon name="Globe" size={15} className="text-slate-400" />
            Слежение за сайтами
            <span className="text-[11px] font-normal text-slate-500">{sources.length} источников</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCheckSources}
              disabled={busy || sources.length === 0}
              className="text-xs text-slate-500 hover:text-sky-700 transition flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1.5 disabled:opacity-40"
            >
              <Icon name="RefreshCw" size={13} />
              {busy ? "Проверяем…" : "Проверить"}
            </button>
            <button
              onClick={() => setAdding(v => !v)}
              className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
            >
              <Icon name={adding ? "X" : "Plus"} size={13} />
              {adding ? "Отмена" : "Добавить сайт"}
            </button>
          </div>
        </div>

        {adding && (
          <div className="bg-slate-50 rounded-lg p-3 mb-2 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Название, например ЖК Зима *"
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
              />
              <input
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="Ссылка на сайт *"
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
              />
            </div>
            <input
              value={form.keywords}
              onChange={e => setForm({ ...form, keywords: e.target.value })}
              placeholder="Слова-маяки через запятую: акция, старт продаж, новый корпус"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
            />
            <button
              onClick={save}
              className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition"
            >
              Следить за сайтом
            </button>
          </div>
        )}

        {sources.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center">
            Добавьте сайты застройщиков и клиентов — система заметит, когда там появятся новости
          </div>
        ) : (
          <div className="space-y-1">
            {sources.map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 hover:bg-slate-50 group">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-800 hover:text-rose-600 truncate max-w-[180px]"
                >
                  {s.title}
                </a>
                {s.lastStatus === "changed" && (
                  <span className="text-[10px] bg-sky-100 text-sky-700 rounded-full px-2 py-0.5 font-medium">
                    были изменения
                  </span>
                )}
                {s.lastStatus === "error" && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 rounded-full px-2 py-0.5">
                    сайт не открылся
                  </span>
                )}
                {s.keywords && <span className="text-slate-400 truncate hidden sm:block">{s.keywords}</span>}
                <span className="text-slate-400 ml-auto whitespace-nowrap">{agoText(s.lastCheckedAt)}</span>
                <button
                  onClick={() => onDeleteSource(s.id)}
                  className="text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl p-3 mb-3">
        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mb-2">
          <Icon name="Gavel" size={15} className="text-slate-400" />
          Тендеры на наружную рекламу
        </div>
        <div className="text-[11px] text-slate-500 mb-2">
          Поиск по госзакупкам — нажмите запрос, новые лоты попадут в сигналы
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TENDER_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => onSearchTenders(q)}
              disabled={busy}
              className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-900 hover:text-white transition disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-3">
        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mb-2">
          <Icon name="Bell" size={15} className="text-slate-400" />
          Сигналы
          {unread.length > 0 && (
            <span className="text-[10px] bg-rose-600 text-white rounded-full px-2 py-0.5 font-medium">
              {unread.length} новых
            </span>
          )}
        </div>

        {signals.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center">
            Пока тихо — сигналы появятся после проверки сайтов или поиска тендеров
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {signals.map(s => {
              const meta = SIGNAL_META[s.type] || SIGNAL_META.change;
              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-2.5 rounded-lg p-2 ${s.isRead ? "opacity-60" : "bg-slate-50"}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon name={meta.icon} size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-900 line-clamp-2">{s.title}</div>
                    {s.details && <div className="text-[11px] text-slate-500 line-clamp-2">{s.details}</div>}
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.amount && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {s.amount.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          открыть
                        </a>
                      )}
                      <span className="text-[10px] text-slate-400">{agoText(s.createdAt)}</span>
                    </div>
                  </div>
                  {!s.isRead && (
                    <button
                      onClick={() => onReadSignal(s.id)}
                      title="Отметить просмотренным"
                      className="text-slate-300 hover:text-emerald-600 transition shrink-0"
                    >
                      <Icon name="Check" size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
