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
}

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Заявки с сайта</h1>
            <p className="text-slate-500 text-sm mt-1">Всего заявок: {leads.length}</p>
          </div>
          <a href="/" className="text-sm text-rose-600 hover:underline">← На сайт</a>
        </div>

        {loading && <div className="text-slate-500">Загружаем…</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

        {!loading && !error && leads.length === 0 && (
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
                    <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-rose-600 font-medium">{l.phone}</a>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{formatDate(l.createdAt)}</div>
                    <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{l.source}</span>
                  </div>
                </div>
                {l.comment && <p className="mt-3 text-slate-600 text-sm leading-relaxed">{l.comment}</p>}
                {(l.duration || l.days || l.totalPrice) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {l.duration && <span className="bg-slate-100 rounded-full px-3 py-1">{l.duration}″</span>}
                    {l.days && <span className="bg-slate-100 rounded-full px-3 py-1">{l.days} дней</span>}
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