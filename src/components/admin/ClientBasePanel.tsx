import { useState, useEffect, useCallback } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import ContactCard from "./ContactCard";
import CallTodayPanel from "./CallTodayPanel";
import CityAdsPanel from "./CityAdsPanel";
import { Contact, ContactsData, FreeMonth, FUNNEL_LABELS, FUNNEL_ORDER } from "./contactTypes";

interface ClientBasePanelProps {
  token: string;
  onLeadCreated: () => void;
}

export default function ClientBasePanel({ token, onLeadCreated }: ClientBasePanelProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ContactsData | null>(null);
  const [freeMonths, setFreeMonths] = useState<FreeMonth[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ industry, status, search });
      const res = await fetch(`${func2url.contacts}?${qs}`, {
        headers: { "X-Session-Token": token },
      });
      if (!res.ok) throw new Error("Не удалось загрузить базу");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [token, industry, status, search]);

  const loadFree = useCallback(async () => {
    try {
      const res = await fetch(func2url.contacts, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify({ action: "freeDays" }),
      });
      if (res.ok) {
        const json = await res.json();
        setFreeMonths(json.months || []);
      }
    } catch {
      setFreeMonths([]);
    }
  }, [token]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [open, load, search]);

  useEffect(() => {
    if (open) loadFree();
  }, [open, loadFree]);

  async function runImport() {
    setImporting(true);
    setError("");
    try {
      const res = await fetch(func2url.contacts, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify({ action: "import" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Импорт не удался (код ${res.status})`);
      if (json.skipped) setError(`База уже загружена: ${json.existing} контактов`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка импорта");
    } finally {
      setImporting(false);
    }
  }

  async function handleTouch(id: number, payload: Record<string, unknown>) {
    const res = await fetch(func2url.contacts, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify({ action: "touch", contactId: id, ...payload }),
    });
    if (!res.ok) throw new Error("Не удалось сохранить результат");
    await load();
  }

  async function handleAddAd(payload: Record<string, unknown>) {
    const res = await fetch(func2url.contacts, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify({ action: "addAd", ...payload }),
    });
    if (!res.ok) throw new Error("Не удалось сохранить наблюдение");
    await load();
  }

  async function handleDeleteAd(id: number) {
    const res = await fetch(func2url.contacts, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify({ action: "deleteAd", adId: id }),
    });
    if (!res.ok) throw new Error("Не удалось удалить наблюдение");
    await load();
  }

  async function handleCreateLead(c: Contact) {
    const leadRes = await fetch(func2url.leads, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: c.company,
        company: c.company,
        phone: c.phone || "не указан",
        email: c.email || "",
        comment: ["Из клиентской базы", c.industry, c.category, c.note].filter(Boolean).join(" · ").slice(0, 400),
        source: "manual",
      }),
    });
    const leadJson = await leadRes.json().catch(() => ({}));
    if (!leadRes.ok) throw new Error(leadJson.error || "Не удалось создать заявку");

    await fetch(func2url.contacts, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Session-Token": token },
      body: JSON.stringify({ id: c.id, leadId: leadJson.id, funnelStatus: "won" }),
    });
    await load();
    onLeadCreated();
  }

  const hasBase = data && data.total > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Icon name="Users" size={19} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-base flex items-center gap-1.5">
              Клиентская база
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {hasBase
                ? `${data!.total} контактов · кому звонить и что предлагать`
                : "Потенциальные клиенты, обзвон и мониторинг города"}
            </div>
          </div>
        </button>
      </div>

      {open && (
        <div className="px-5 pb-5">
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-xs mb-3">
              {error}
            </div>
          )}

          {loading && !data && (
            <div className="text-sm text-slate-400 py-6 text-center">Загружаем базу…</div>
          )}

          {!loading && !hasBase && (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <Icon name="Users" size={32} className="mx-auto text-slate-300 mb-2" />
              <div className="text-sm text-slate-600 font-medium">База ещё не загружена</div>
              <div className="text-xs text-slate-500 mt-1 mb-3">
                Перенесём 471 контакт из вашего файла: отраслевые базы, маркетологи,
                байеры и мониторинг рекламы в городе
              </div>
              <button
                onClick={runImport}
                disabled={importing}
                className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition disabled:opacity-50"
              >
                {importing ? "Переносим…" : "Загрузить базу из файла"}
              </button>
            </div>
          )}

          {hasBase && (
            <>
              <CallTodayPanel
                due={data!.due}
                sleeping={data!.sleeping}
                ads={data!.ads}
                freeMonths={freeMonths}
                onFocus={ind => {
                  setIndustry(ind);
                  setStatus("all");
                  setSearch("");
                }}
              />

              <CityAdsPanel ads={data!.ads} onAdd={handleAddAd} onDelete={handleDeleteAd} />

              <div className="relative mb-3">
                <Icon
                  name="Search"
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по названию, телефону, почте или примечанию"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  onClick={() => setIndustry("all")}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${industry === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Все ({data!.total})
                </button>
                {data!.industries.map(i => (
                  <button
                    key={i.name}
                    onClick={() => setIndustry(i.name)}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${industry === i.name ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {i.name} ({i.count})
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setStatus("all")}
                  className={`text-[11px] rounded-full px-2.5 py-1 transition ${status === "all" ? "bg-slate-700 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  Любой статус
                </button>
                {FUNNEL_ORDER.filter(s => data!.statuses[s]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`text-[11px] rounded-full px-2.5 py-1 transition ${status === s ? "bg-slate-700 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    {FUNNEL_LABELS[s]} ({data!.statuses[s]})
                  </button>
                ))}
              </div>

              {loading && <div className="text-xs text-slate-400 mb-2">Обновляем…</div>}

              {data!.items.length === 0 ? (
                <div className="text-sm text-slate-400 py-6 text-center">
                  Ничего не найдено — измените фильтры
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {data!.items.map(c => (
                    <ContactCard
                      key={c.id}
                      contact={c}
                      onTouch={handleTouch}
                      onCreateLead={handleCreateLead}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
