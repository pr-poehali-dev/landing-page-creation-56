import { useState, useEffect, useMemo } from "react";
import func2url from "../../backend/func2url.json";
import Icon from "@/components/ui/icon";

interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string | null;
  duration: number | null;
  days: number | null;
  needVideo: boolean;
  totalPrice: number | null;
  source: string;
  status: string;
  createdAt: string | null;
  company: string | null;
  startDate: string | null;
  endDate: string | null;
  placementAmount: number | null;
  videoAmount: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  estimate: "Смета",
  contract: "Договор",
  payment: "Оплата",
  live: "Эфир",
  completed: "Завершена",
  lost: "Потеряна",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  estimate: "bg-amber-100 text-amber-700",
  contract: "bg-blue-100 text-blue-700",
  payment: "bg-purple-100 text-purple-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const STATUS_ORDER = ["new", "estimate", "contract", "payment", "live", "completed", "lost"];
const ACTIVE_STATUSES = ["new", "estimate", "contract", "payment", "live"];

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [adminKey, setAdminKey] = useState<string | null>(() => localStorage.getItem("fb-admin-key"));
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!adminKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(func2url.leads, { headers: { "X-Admin-Key": adminKey } })
      .then(r => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      })
      .then(d => setLeads(d.leads || []))
      .catch(err => {
        if (err.message === "forbidden") {
          localStorage.removeItem("fb-admin-key");
          setAdminKey(null);
          setAuthError("Неверный пароль");
        } else {
          setError("Не удалось загрузить заявки");
        }
      })
      .finally(() => setLoading(false));
  }, [adminKey]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setChecking(true);
    fetch(func2url.leads, { headers: { "X-Admin-Key": keyInput } })
      .then(r => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      })
      .then(d => {
        localStorage.setItem("fb-admin-key", keyInput);
        setAdminKey(keyInput);
        setLeads(d.leads || []);
      })
      .catch(() => setAuthError("Неверный пароль"))
      .finally(() => setChecking(false));
  }

  function handleLogout() {
    localStorage.removeItem("fb-admin-key");
    setAdminKey(null);
    setKeyInput("");
    setLeads([]);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUS_ORDER) c[s] = leads.filter(l => l.status === s).length;
    return c;
  }, [leads]);

  const activeSum = useMemo(
    () => leads.filter(l => ACTIVE_STATUSES.includes(l.status)).reduce((sum, l) => sum + (l.totalPrice || 0), 0),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const base = statusFilter === "all" ? leads : leads.filter(l => l.status === statusFilter);
    const sorted = [...base];
    if (sortBy === "price") {
      sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return sorted;
  }, [leads, statusFilter, sortBy]);

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  async function changeStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("fail");
      setLeads(prev => prev.map(l => (l.id === id ? { ...l, status } : l)));
    } catch {
      setError("Не удалось изменить статус");
    } finally {
      setUpdating(null);
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Lock" size={20} className="text-slate-400" />
            <h1 className="text-xl font-bold text-slate-900">Вход в CRM</h1>
          </div>
          <p className="text-slate-500 text-sm mb-5">Введите пароль для доступа к заявкам</p>
          <input
            type="password"
            autoFocus
            placeholder="Пароль"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rose-400 mb-3"
          />
          {authError && <div className="text-red-600 text-xs mb-3">{authError}</div>}
          <button
            type="submit"
            disabled={checking || !keyInput}
            className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
          >
            {checking ? "Проверяем…" : "Войти"}
          </button>
          <a href="/" className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-4">← На сайт</a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Заявки и сделки</h1>
            <p className="text-slate-500 text-sm mt-1">Всего: {leads.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-rose-600 hover:underline">← На сайт</a>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>

        {!loading && leads.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">В работе (без учёта завершённых и потерянных)</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{activeSum.toLocaleString("ru-RU")} ₽</div>
            </div>
            <div className="text-sm text-slate-500">{counts["new"] + counts["estimate"] + counts["contract"] + counts["payment"] + counts["live"]} активных сделок</div>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                Все ({counts.all})
              </button>
              {STATUS_ORDER.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${statusFilter === s ? "bg-slate-900 text-white" : `${STATUS_COLORS[s]} hover:opacity-80`}`}
                >
                  {STATUS_LABELS[s]} ({counts[s]})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1">
              <button
                onClick={() => setSortBy("date")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition flex items-center gap-1 ${sortBy === "date" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon name="Clock" size={13} />
                По дате
              </button>
              <button
                onClick={() => setSortBy("price")}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition flex items-center gap-1 ${sortBy === "price" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon name="ArrowDownWideNarrow" size={13} />
                По сумме
              </button>
            </div>
          </div>
        )}

        {loading && <div className="text-slate-500">Загружаем…</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{error}</div>}

        {!loading && leads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Icon name="Inbox" size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Заявок пока нет</p>
          </div>
        )}

        {!loading && leads.length > 0 && filteredLeads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Icon name="Filter" size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Нет заявок с таким статусом</p>
          </div>
        )}

        {!loading && filteredLeads.length > 0 && (
          <div className="grid gap-3">
            {filteredLeads.map(l => (
              <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 text-lg">{l.name}</div>
                    {l.company && <div className="text-slate-500 text-sm">{l.company}</div>}
                    <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-rose-600 font-medium">{l.phone}</a>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xs text-slate-400">{formatDate(l.createdAt)}</div>
                    <select
                      value={l.status}
                      disabled={updating === l.id}
                      onChange={e => changeStatus(l.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer outline-none ${STATUS_COLORS[l.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {l.comment && <p className="mt-3 text-slate-600 text-sm leading-relaxed">{l.comment}</p>}
                {(l.duration || l.days || l.totalPrice || l.startDate) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {l.duration && <span className="bg-slate-100 rounded-full px-3 py-1">{l.duration}″</span>}
                    {l.days && <span className="bg-slate-100 rounded-full px-3 py-1">{l.days} дней</span>}
                    {l.startDate && <span className="bg-slate-100 rounded-full px-3 py-1">с {formatDate(l.startDate).split(",")[0]}</span>}
                    {l.endDate && <span className="bg-slate-100 rounded-full px-3 py-1">по {formatDate(l.endDate).split(",")[0]}</span>}
                    {l.needVideo && <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1">нужно видео</span>}
                    {l.totalPrice && <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 font-semibold">{l.totalPrice.toLocaleString("ru-RU")} ₽</span>}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition">Позвонить</a>
                  <a href="https://t.me/flashboard_vl" target="_blank" rel="noopener noreferrer" className="text-sm bg-sky-500 text-white rounded-lg px-4 py-2 hover:bg-sky-600 transition">Telegram</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;