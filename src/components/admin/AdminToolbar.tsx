import Icon from "@/components/ui/icon";

interface AdminToolbarProps {
  leadsCount: number;
  loading: boolean;
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

    </>
  );
}