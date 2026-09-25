import Icon from "@/components/ui/icon";
import { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "./adminTypes";

interface AdminToolbarProps {
  leadsCount: number;
  loading: boolean;
  activeSum: number;
  counts: Record<string, number>;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: "date" | "price";
  setSortBy: (v: "date" | "price") => void;
  onLogout: () => void;
  onChangePassword: () => void;
  staffName?: string;
  staffRole?: string;
  search: string;
  setSearch: (v: string) => void;
  foundCount: number;
}

export default function AdminToolbar({
  leadsCount,
  loading,
  activeSum,
  counts,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onLogout,
  onChangePassword,
  staffName,
  staffRole,
  search,
  setSearch,
  foundCount,
}: AdminToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Заявки и сделки</h1>
          <p className="text-slate-500 text-sm mt-1">Всего: {leadsCount}</p>
        </div>
        <div className="flex items-center gap-4">
          {staffName && (
            <div className="text-right">
              <div className="text-sm font-medium text-slate-700">{staffName}</div>
              <div className="text-[11px] text-slate-400">
                {staffRole === "director" ? "Руководитель" : "Менеджер"}
              </div>
            </div>
          )}
          <button
            onClick={onChangePassword}
            className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <Icon name="KeyRound" size={14} />
            Сменить пароль
          </button>
          <a href="/" className="text-sm text-rose-600 hover:underline">← На сайт</a>
          <button onClick={onLogout} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>
      </div>

      {!loading && leadsCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">В работе (без учёта завершённых и потерянных)</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{activeSum.toLocaleString("ru-RU")} ₽</div>
          </div>
          <div className="text-sm text-slate-500">{counts["new"] + counts["estimate"] + counts["contract"] + counts["payment"] + counts["live"]} активных сделок</div>
        </div>
      )}

      {!loading && leadsCount > 0 && (
        <div className="relative mb-3">
          <Icon
            name="Search"
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону, организации или почте"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-24 py-3 text-sm outline-none focus:border-rose-400 shadow-sm transition"
          />
          {search && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">
                {foundCount === 0 ? "не найдено" : `найдено: ${foundCount}`}
              </span>
              <button
                onClick={() => setSearch("")}
                title="Очистить"
                className="text-slate-400 hover:text-slate-700 transition p-1"
              >
                <Icon name="X" size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && leadsCount > 0 && (
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
    </>
  );
}