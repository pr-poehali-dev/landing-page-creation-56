import { useState } from "react";
import Icon from "@/components/ui/icon";
import PasswordInput from "./PasswordInput";
import func2url from "../../../backend/func2url.json";

interface ChangePasswordModalProps {
  token: string;
  onClose: () => void;
}

const FIELD =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rose-400";

export default function ChangePasswordModal({ token, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 6) {
      setError("Новый пароль должен быть от 6 символов");
      return;
    }
    if (next !== repeat) {
      setError("Пароли не совпадают");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(func2url.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword: current,
          newPassword: next,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Не удалось сменить пароль");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-3">
              <Icon name="Check" size={24} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Пароль изменён</h2>
            <p className="text-sm text-slate-500 mb-5">
              Входите с новым паролем. Остальные устройства, где вы были в системе, вышли автоматически.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition"
            >
              Понятно
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Icon name="KeyRound" size={18} className="text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Смена пароля</h2>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <Icon name="X" size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Новый пароль будет известен только вам — восстановить его нельзя.
            </p>

            <div className="space-y-2 mb-3">
              <PasswordInput
                autoFocus
                placeholder="Текущий пароль"
                value={current}
                onChange={setCurrent}
                className={FIELD}
              />
              <PasswordInput
                placeholder="Новый пароль (от 6 символов)"
                value={next}
                onChange={setNext}
                className={FIELD}
              />
              <PasswordInput
                placeholder="Повторите новый пароль"
                value={repeat}
                onChange={setRepeat}
                className={FIELD}
              />
            </div>

            {error && <div className="text-red-600 text-xs mb-3">{error}</div>}

            <button
              type="submit"
              disabled={saving || !current || !next || !repeat}
              className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
            >
              {saving ? "Сохраняем…" : "Сменить пароль"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
