import { useState, useEffect, useCallback } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import {
  AuditEntry,
  StaffMember,
  TrashItem,
  BackupRun,
  ACTION_LABELS,
  ACTION_ICONS,
  fmtWhen,
} from "./securityTypes";

interface SecurityPanelProps {
  token: string;
  role: string;
  onRestored: () => void;
}

export default function SecurityPanel({ token, role, onRestored }: SecurityPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"log" | "team" | "trash">("log");
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [team, setTeam] = useState<StaffMember[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [backups, setBackups] = useState<BackupRun[]>([]);
  const [warnings, setWarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [filter, setFilter] = useState("all");

  const isDirector = role === "director";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const trashRes = await fetch(func2url.security, { headers: { "X-Session-Token": token } });
      if (trashRes.ok) {
        const j = await trashRes.json();
        setTrash(j.items || []);
        setBackups(j.backups || []);
      }

      if (isDirector) {
        const res = await fetch(`${func2url.auth}?severity=${filter}&limit=150`, {
          headers: { "X-Session-Token": token },
        });
        if (res.ok) {
          const j = await res.json();
          setEntries(j.entries || []);
          setTeam(j.team || []);
          setWarnings(j.warnings || 0);
        }
      }
    } catch {
      setError("Не удалось загрузить данные безопасности");
    } finally {
      setLoading(false);
    }
  }, [token, isDirector, filter]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function act(url: string, payload: Record<string, unknown>, msg?: string) {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Действие не выполнено");
      if (json.password) setInfo(`Новый пароль: ${json.password}`);
      else if (msg) setInfo(msg);
      await load();
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Icon name="ShieldCheck" size={19} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-base flex items-center gap-1.5">
              Безопасность
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {isDirector ? "Журнал действий, сотрудники, корзина и копии" : "Корзина и резервные копии"}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {warnings > 0 && (
            <span className="text-[11px] bg-amber-100 text-amber-800 rounded-full px-2.5 py-1 font-medium">
              {warnings} важных событий за неделю
            </span>
          )}
          {trash.length > 0 && (
            <span className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 font-medium">
              в корзине {trash.length}
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
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 text-xs mb-3 select-all">
              {info}
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 mb-3 w-fit">
            {isDirector && (
              <>
                <button
                  onClick={() => setTab("log")}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${tab === "log" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
                >
                  Журнал
                </button>
                <button
                  onClick={() => setTab("team")}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${tab === "team" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
                >
                  Сотрудники
                </button>
              </>
            )}
            <button
              onClick={() => setTab("trash")}
              className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${tab === "trash" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
            >
              Корзина и копии
            </button>
          </div>

          {loading && <div className="text-sm text-slate-400 py-4 text-center">Загружаем…</div>}

          {tab === "log" && isDirector && (
            <>
              <div className="flex gap-1.5 mb-2">
                {[
                  { v: "all", l: "Все события" },
                  { v: "warning", l: "Только важные" },
                ].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setFilter(f.v)}
                    className={`text-[11px] rounded-full px-3 py-1.5 transition ${filter === f.v ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
              {entries.length === 0 ? (
                <div className="text-sm text-slate-400 py-6 text-center">Событий пока нет</div>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                  {entries.map(e => (
                    <div
                      key={e.id}
                      className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 ${e.severity === "warning" ? "bg-amber-50" : "hover:bg-slate-50"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${e.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Icon name={ACTION_ICONS[e.action] || "Circle"} size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-slate-900">
                          <b>{e.staffName || "Неизвестно"}</b>{" "}
                          {ACTION_LABELS[e.action] || e.action}
                        </div>
                        {e.details && <div className="text-[11px] text-slate-500">{e.details}</div>}
                      </div>
                      <div className="text-[10px] text-slate-400 text-right shrink-0">
                        <div>{fmtWhen(e.createdAt)}</div>
                        {e.ip && <div>{e.ip}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "team" && isDirector && (
            <div className="space-y-2">
              {team.map(m => (
                <div key={m.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                      {m.name}
                      <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${m.role === "director" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                        {m.roleLabel}
                      </span>
                      {!m.active && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 rounded-full px-2 py-0.5 font-medium">
                          отключён
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      логин {m.login} · {m.lastLoginAt ? `вход ${fmtWhen(m.lastLoginAt)}` : "ещё не входил"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        act(func2url.auth, {
                          action: "setRole",
                          staffId: m.id,
                          role: m.role === "director" ? "manager" : "director",
                        })
                      }
                      disabled={busy}
                      className="text-[11px] border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      {m.role === "director" ? "Сделать менеджером" : "Сделать руководителем"}
                    </button>
                    <button
                      onClick={() => act(func2url.auth, { action: "resetPassword", staffId: m.id })}
                      disabled={busy}
                      className="text-[11px] border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Сбросить пароль
                    </button>
                    <button
                      onClick={() =>
                        act(
                          func2url.auth,
                          { action: "toggleStaff", staffId: m.id, active: !m.active },
                          m.active ? "Доступ отключён" : "Доступ восстановлен"
                        )
                      }
                      disabled={busy}
                      className={`text-[11px] rounded-lg px-2.5 py-1.5 transition disabled:opacity-50 ${m.active ? "bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                    >
                      {m.active ? "Отключить" : "Включить"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "trash" && (
            <>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Корзина · удалённое хранится 30 дней
              </div>
              {trash.length === 0 ? (
                <div className="text-sm text-slate-400 py-4 text-center">Корзина пуста</div>
              ) : (
                <div className="space-y-1.5 mb-4">
                  {trash.map(t => (
                    <div key={t.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 flex-wrap">
                      <span className="text-sm text-slate-900 font-medium truncate">{t.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {t.removedBy ? `удалил ${t.removedBy}` : ""} · {fmtWhen(t.createdAt)}
                      </span>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${t.daysLeft <= 5 ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-600"}`}>
                        осталось {t.daysLeft} дн.
                      </span>
                      <button
                        onClick={() =>
                          act(func2url.security, { action: "restore", trashId: t.id }, "Запись восстановлена").then(
                            onRestored
                          )
                        }
                        disabled={busy}
                        className="ml-auto text-[11px] bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition disabled:opacity-50"
                      >
                        Восстановить
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="text-xs font-medium text-slate-500">
                  Резервные копии · создаются автоматически раз в месяц
                </div>
                {isDirector && (
                  <button
                    onClick={() => act(func2url.security, { action: "backup" }, "Копия создана")}
                    disabled={busy}
                    className="text-xs border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <Icon name="DatabaseBackup" size={13} />
                    {busy ? "Создаём…" : "Создать копию"}
                  </button>
                )}
              </div>
              {backups.length === 0 ? (
                <div className="text-sm text-slate-400 py-3 text-center">Копий пока нет</div>
              ) : (
                <div className="space-y-1">
                  {backups.map(b => (
                    <div key={b.id} className="flex items-center gap-2 text-xs px-2.5 py-1.5 hover:bg-slate-50 rounded-lg">
                      <Icon name="DatabaseBackup" size={13} className="text-slate-400 shrink-0" />
                      <span className="text-slate-700">{fmtWhen(b.createdAt)}</span>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 ${b.kind === "auto" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`}>
                        {b.kind === "auto" ? "автоматически" : "вручную"}
                      </span>
                      <span className="text-slate-400">{b.note}</span>
                      {b.url && (
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-rose-600 hover:underline"
                        >
                          скачать
                        </a>
                      )}
                    </div>
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
