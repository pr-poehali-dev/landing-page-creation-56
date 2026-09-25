import { useState } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import PasswordInput from "./PasswordInput";

interface StaffLoginProps {
  onLogin: (session: { token: string; name: string; role: string; mustChange: boolean }) => void;
}

export default function StaffLogin({ onLogin }: StaffLoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [created, setCreated] = useState<{ name: string; login: string; password: string }[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const res = await fetch(func2url.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", login, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Не удалось войти");
      onLogin(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setChecking(false);
    }
  }

  async function runSetup(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const res = await fetch(func2url.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": masterKey },
        body: JSON.stringify({ action: "setup" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Не удалось создать аккаунты");
      if (!json.created?.length) {
        setError("Аккаунты уже созданы — войдите под своим логином");
      } else {
        setCreated(json.created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setChecking(false);
    }
  }

  if (created.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="KeyRound" size={20} className="text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Аккаунты созданы</h1>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Запишите пароли — показываются один раз. При первом входе система попросит сменить пароль.
          </p>
          <div className="space-y-2 mb-4">
            {created.map(c => (
              <div key={c.login} className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium text-slate-900 text-sm">{c.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  логин: <b className="text-slate-700">{c.login}</b>
                </div>
                <div className="text-xs text-slate-500">
                  пароль: <b className="text-rose-600 select-all">{c.password}</b>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setCreated([]);
              setSetupMode(false);
            }}
            className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition"
          >
            Перейти ко входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form
        onSubmit={setupMode ? runSetup : submit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Lock" size={20} className="text-slate-400" />
          <h1 className="text-xl font-bold text-slate-900">
            {setupMode ? "Создание аккаунтов" : "Вход в CRM"}
          </h1>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          {setupMode
            ? "Введите мастер-пароль, система создаст аккаунты сотрудников"
            : "Личный логин и пароль сотрудника"}
        </p>

        {setupMode ? (
          <div className="mb-3">
            <PasswordInput
              autoFocus
              placeholder="Мастер-пароль"
              value={masterKey}
              onChange={setMasterKey}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            />
          </div>
        ) : (
          <>
            <input
              autoFocus
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rose-400 mb-2"
            />
            <div className="mb-3">
              <PasswordInput
                placeholder="Пароль"
                value={password}
                onChange={setPassword}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rose-400"
              />
            </div>
          </>
        )}

        {error && <div className="text-red-600 text-xs mb-3">{error}</div>}

        <button
          type="submit"
          disabled={checking || (setupMode ? !masterKey : !login || !password)}
          className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
        >
          {checking ? "Проверяем…" : setupMode ? "Создать аккаунты" : "Войти"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSetupMode(v => !v);
            setError("");
          }}
          className="w-full text-xs text-slate-400 hover:text-slate-600 mt-3"
        >
          {setupMode ? "← Вернуться ко входу" : "Первый запуск: создать аккаунты"}
        </button>

        <a href="/" className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-3">
          ← На сайт
        </a>
      </form>
    </div>
  );
}
