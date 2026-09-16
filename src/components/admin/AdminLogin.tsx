import Icon from "@/components/ui/icon";

interface AdminLoginProps {
  keyInput: string;
  setKeyInput: (v: string) => void;
  authError: string;
  checking: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminLogin({ keyInput, setKeyInput, authError, checking, onSubmit }: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
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
