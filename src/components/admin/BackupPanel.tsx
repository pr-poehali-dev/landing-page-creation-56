import { useState, useEffect } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";

interface BackupItem {
  id: number;
  period: string;
  url: string;
  leadsCount: number;
  docsCount: number;
  totalSum: number;
  createdAt: string | null;
}

interface BackupPanelProps {
  token: string;
}

function periodLabel(period: string) {
  const months = ["январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const [y, m] = period.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] || period} ${y}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function BackupPanel({ token }: BackupPanelProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    fetch(func2url.backup, { headers: { "X-Session-Token": token } })
      .then(r => r.json())
      .then(d => {
        setItems(d.backups || []);
        setLoaded(true);
      })
      .catch(() => setError("Не удалось загрузить список архивов"))
      .finally(() => setLoading(false));
  }, [open, loaded, token]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const hasThisMonth = items.some(i => i.period === thisMonth);

  function createBackup() {
    setCreating(true);
    setError("");
    fetch(func2url.backup, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify({}),
    })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Ошибка выгрузки");
        return d;
      })
      .then(d => {
        setItems(prev => [{
          id: d.id, period: d.period, url: d.url,
          leadsCount: d.leadsCount, docsCount: d.docsCount,
          totalSum: d.totalSum, createdAt: new Date().toISOString(),
        }, ...prev]);
        window.open(d.url, "_blank");
      })
      .catch(e => setError(e.message))
      .finally(() => setCreating(false));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Icon name="DatabaseBackup" size={18} className="text-emerald-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-sm">Резервные копии базы</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {hasThisMonth
                ? "Копия за этот месяц готова"
                : "Копия за этот месяц ещё не создана"}
            </div>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-slate-400" />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              В файл попадают все заявки с реквизитами и суммами, перечень документов со ссылками
              и сводка по статусам. Рекомендуем создавать копию раз в месяц и хранить у себя.
            </p>
            <button
              onClick={createBackup}
              disabled={creating}
              className="shrink-0 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium rounded-xl px-4 py-2.5 flex items-center gap-2 transition"
            >
              <Icon name={creating ? "Loader2" : "Download"} size={15} className={creating ? "animate-spin" : ""} />
              {creating ? "Готовлю файл..." : "Создать выгрузку"}
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2 mb-3">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-slate-400 py-3">Загружаю архивы...</div>}

          {!loading && items.length === 0 && (
            <div className="text-sm text-slate-400 py-3">
              Пока нет ни одной копии. Нажмите «Создать выгрузку».
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map(it => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 capitalize">
                      {periodLabel(it.period)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {it.leadsCount} заявок · {it.docsCount} документов · {it.totalSum.toLocaleString("ru-RU")} ₽ · {fmtDate(it.createdAt)}
                    </div>
                  </div>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-2 flex items-center gap-1.5 transition"
                  >
                    <Icon name="FileSpreadsheet" size={14} />
                    Скачать Excel
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
