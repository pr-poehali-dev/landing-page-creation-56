import { useState } from "react";
import Icon from "@/components/ui/icon";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  eyeClassName?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Пароль",
  autoFocus,
  className = "",
  eyeClassName = "text-slate-400 hover:text-slate-700",
}: PasswordInputProps) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <input
        type={shown ? "text" : "password"}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShown(v => !v)}
        title={shown ? "Скрыть пароль" : "Показать пароль"}
        aria-label={shown ? "Скрыть пароль" : "Показать пароль"}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition ${eyeClassName}`}
      >
        <Icon name={shown ? "EyeOff" : "Eye"} size={17} />
      </button>
    </div>
  );
}
