import Icon from "@/components/ui/icon";

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  hint?: string;
}

export default function ValidatedInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = "text",
  inputMode,
  hint,
}: ValidatedInputProps) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full text-sm border rounded-lg px-3 py-2 outline-none transition ${
          error
            ? "border-amber-400 bg-amber-50/40 focus:border-amber-500"
            : "border-slate-200 focus:border-rose-400"
        }`}
      />
      {error ? (
        <div className="flex items-start gap-1.5 mt-1 text-[11px] text-amber-700">
          <Icon name="TriangleAlert" size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="text-[11px] text-slate-400 mt-1">{hint}</div>
      ) : null}
    </div>
  );
}
