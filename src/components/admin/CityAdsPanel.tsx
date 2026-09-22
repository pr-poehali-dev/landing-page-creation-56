import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { CityAd } from "./contactTypes";

interface CityAdsPanelProps {
  ads: CityAd[];
  onAdd: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const SCREEN_PRESETS = [
  "Цифровой билборд",
  "Медиафасад ТЦ Родина",
  "Медиафасад напротив Родины",
  "Медиафасад на Скай сити",
  "Цифровой суперсайт",
];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function CityAdsPanel({ ads, onAdd, onDelete }: CityAdsPanelProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onlyOurs, setOnlyOurs] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    brand: "",
    screen: "",
    address: "",
    company: "",
    source: "Местный",
    seen: new Date().toISOString().slice(0, 10),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return ads.filter(a => {
      if (onlyOurs && !a.wasOurClient) return false;
      if (!s) return true;
      return [a.brand, a.company, a.screen, a.address]
        .filter(Boolean)
        .some(v => (v as string).toLowerCase().includes(s));
    });
  }, [ads, onlyOurs, search]);

  const ourCount = ads.filter(a => a.wasOurClient).length;

  async function handleSave() {
    if (!form.brand.trim()) return;
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ ...form, brand: "", company: "", address: "" });
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl mb-3">
      <div className="p-3 flex items-center justify-between gap-2 flex-wrap">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 text-left min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <Icon name="Eye" size={15} className="text-rose-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              Реклама в городе
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-slate-400" />
            </div>
            <div className="text-[11px] text-slate-500">
              {ads.length} наблюдений
              {ourCount > 0 && <span className="text-rose-600"> · {ourCount} ваших брендов у конкурентов</span>}
            </div>
          </div>
        </button>
        {open && (
          <button
            onClick={() => setAdding(v => !v)}
            className="text-xs bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition flex items-center gap-1"
          >
            <Icon name={adding ? "X" : "Plus"} size={13} />
            {adding ? "Отмена" : "Заметил рекламу"}
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3">
          {adding && (
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={form.brand}
                  onChange={e => setForm({ ...form, brand: e.target.value })}
                  placeholder="Бренд или ролик *"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
                />
                <input
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="Компания или агентство"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
                />
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Адрес экрана"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
                />
                <input
                  type="date"
                  value={form.seen}
                  onChange={e => setForm({ ...form, seen: e.target.value })}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {SCREEN_PRESETS.map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, screen: s })}
                    className={`text-[11px] rounded-full px-2.5 py-1 transition ${
                      form.screen === s
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {["Местный", "Федеральный"].map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, source: s })}
                    className={`text-[11px] rounded-full px-2.5 py-1 transition ${
                      form.source === s
                        ? "bg-slate-700 text-white"
                        : "bg-white border border-slate-200 text-slate-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={handleSave}
                  disabled={saving || !form.brand.trim()}
                  className="ml-auto text-sm bg-rose-600 text-white rounded-lg px-4 py-2 hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {saving ? "Сохраняем…" : "Записать наблюдение"}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Icon
                name="Search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по бренду или адресу"
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-rose-400"
              />
            </div>
            <button
              onClick={() => setOnlyOurs(v => !v)}
              className={`text-[11px] rounded-full px-3 py-1.5 transition whitespace-nowrap ${
                onlyOurs ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Только наши бренды ({ourCount})
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">Ничего не найдено</div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {filtered.map((a, i) => (
                <div
                  key={a.id ?? i}
                  className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 group ${
                    a.wasOurClient ? "bg-rose-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium text-slate-900 truncate max-w-[160px]">{a.brand}</span>
                  {a.wasOurClient && (
                    <span className="text-[10px] bg-rose-200 text-rose-800 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">
                      был у вас
                    </span>
                  )}
                  <span className="text-slate-500 truncate">{a.screen || a.address || "—"}</span>
                  {a.company && <span className="text-slate-400 truncate hidden sm:block">{a.company}</span>}
                  <span className="text-slate-400 ml-auto whitespace-nowrap">{fmtDate(a.seen)}</span>
                  {a.id && (
                    <button
                      onClick={() => onDelete(a.id!)}
                      title="Удалить наблюдение"
                      className="text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
