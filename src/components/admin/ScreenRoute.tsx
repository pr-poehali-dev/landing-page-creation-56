import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ScreenPoint, agoText } from "./monitoringTypes";

interface ScreenRouteProps {
  points: ScreenPoint[];
  onCheck: (pointId: number, brand: string) => Promise<void>;
  onAdd: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (pointId: number) => Promise<void>;
}

export default function ScreenRoute({ points, onCheck, onAdd, onDelete }: ScreenRouteProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [brand, setBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ screenType: "", address: "", operator: "", checkDays: 7 });

  const overdue = points.filter(p => p.overdue);

  async function submit(pointId: number) {
    setSaving(true);
    try {
      await onCheck(pointId, brand.trim());
      setBrand("");
      setActiveId(null);
    } finally {
      setSaving(false);
    }
  }

  async function addPoint() {
    if (!form.screenType.trim() || !form.address.trim()) return;
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ screenType: "", address: "", operator: "", checkDays: 7 });
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
          <Icon name="Route" size={15} className="text-slate-400" />
          Маршрут объезда
          <span className="text-[11px] font-normal text-slate-500">
            {points.length} точек
            {overdue.length > 0 && (
              <span className="text-amber-700"> · {overdue.length} пора проверить</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setAdding(v => !v)}
          className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
        >
          <Icon name={adding ? "X" : "Plus"} size={13} />
          {adding ? "Отмена" : "Добавить точку"}
        </button>
      </div>

      {adding && (
        <div className="bg-slate-50 rounded-lg p-3 mb-2 grid gap-2 sm:grid-cols-2">
          <input
            value={form.screenType}
            onChange={e => setForm({ ...form, screenType: e.target.value })}
            placeholder="Тип экрана *"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
          />
          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Адрес *"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
          />
          <input
            value={form.operator}
            onChange={e => setForm({ ...form, operator: e.target.value })}
            placeholder="Оператор экрана"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={form.checkDays}
              onChange={e => setForm({ ...form, checkDays: Number(e.target.value) || 7 })}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-20 outline-none focus:border-rose-400"
            />
            <span className="text-xs text-slate-500">дней между проверками</span>
            <button
              onClick={addPoint}
              disabled={saving}
              className="ml-auto text-sm bg-slate-900 text-white rounded-lg px-3 py-2 hover:bg-slate-700 transition disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {points.map(p => (
          <div
            key={p.id}
            className={`rounded-lg px-2.5 py-2 group ${p.overdue ? "bg-amber-50" : "bg-slate-50"}`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-900">{p.screenType}</span>
              <span className="text-xs text-slate-500 truncate flex-1 min-w-0">{p.address}</span>
              <span className={`text-[10px] whitespace-nowrap ${p.overdue ? "text-amber-700 font-medium" : "text-slate-400"}`}>
                {agoText(p.lastCheckedAt)}
              </span>
              <button
                onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                className="text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1 hover:bg-slate-100 transition whitespace-nowrap"
              >
                {activeId === p.id ? "Закрыть" : "Проверил"}
              </button>
              <button
                onClick={() => onDelete(p.id)}
                title="Убрать точку из маршрута"
                className="text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
              >
                <Icon name="Trash2" size={13} />
              </button>
            </div>

            {activeId === p.id && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="Чей ролик увидели (можно пропустить)"
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-[160px] outline-none focus:border-rose-400"
                />
                <button
                  onClick={() => submit(p.id)}
                  disabled={saving}
                  className="text-xs bg-emerald-600 text-white rounded-lg px-3 py-1.5 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {saving ? "…" : brand.trim() ? "Записать ролик" : "Отметить проверку"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
