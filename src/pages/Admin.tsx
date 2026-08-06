import { useState, useEffect } from "react";
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

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetch(func2url.leads)
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .catch(() => setError("Не удалось загрузить заявки"))
      .finally(() => setLoading(false));
  }, []);

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
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Заявки и сделки</h1>
            <p className="text-slate-500 text-sm mt-1">Всего: {leads.length}</p>
          </div>
          <a href="/" className="text-sm text-rose-600 hover:underline">← На сайт</a>
        </div>

        {loading && <div className="text-slate-500">Загружаем…</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{error}</div>}

        {!loading && leads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Icon name="Inbox" size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Заявок пока нет</p>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <div className="grid gap-3">
            {leads.map(l => (
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
