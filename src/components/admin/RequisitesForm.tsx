import { useState } from "react";
import { Requisites } from "./adminTypes";
import ValidatedInput from "./ValidatedInput";
import {
  validateInn,
  validateEmail,
  validateKpp,
  validateOgrn,
  validateAccount,
  validateBik,
} from "./validation";

interface RequisitesFormProps {
  form: Requisites;
  setForm: (r: Requisites) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

type Validator = (v: string) => string | null;

const FIELDS: {
  key: keyof Requisites;
  label: string;
  wide?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  validate?: Validator;
  hint?: string;
}[] = [
  { key: "company", label: "Организация / ИП", wide: true, placeholder: "ООО «Компания»" },
  {
    key: "email",
    label: "Email для отправки документов",
    wide: true,
    placeholder: "client@company.ru",
    type: "email",
    inputMode: "email",
    validate: validateEmail,
  },
  { key: "inn", label: "ИНН", inputMode: "numeric", validate: validateInn, hint: "10 цифр у организации, 12 у ИП" },
  { key: "kpp", label: "КПП", inputMode: "numeric", validate: validateKpp },
  { key: "ogrn", label: "ОГРН / ОГРНИП", wide: true, inputMode: "numeric", validate: validateOgrn },
  { key: "legalAddress", label: "Юридический адрес", wide: true },
  { key: "bankName", label: "Банк", wide: true },
  { key: "bankAccount", label: "Р/с", inputMode: "numeric", validate: validateAccount },
  { key: "bankBik", label: "БИК", inputMode: "numeric", validate: validateBik },
  { key: "bankCorrAccount", label: "Корр. счёт", wide: true, inputMode: "numeric", validate: validateAccount },
  { key: "signerName", label: "ФИО подписанта", placeholder: "Иванов Иван Иванович" },
  { key: "signerPosition", label: "Должность", placeholder: "Директор" },
];

export default function RequisitesForm({ form, setForm, onSave, onCancel, saving }: RequisitesFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string | null> = {};
  FIELDS.forEach(f => {
    if (f.validate) errors[f.key] = f.validate(form[f.key]);
  });
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FIELDS.map(f => (
        <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
          <ValidatedInput
            label={f.label}
            value={form[f.key]}
            onChange={v => setForm({ ...form, [f.key]: v })}
            onBlur={() => setTouched(t => ({ ...t, [f.key]: true }))}
            error={touched[f.key] ? errors[f.key] : null}
            placeholder={f.placeholder}
            type={f.type}
            inputMode={f.inputMode}
            hint={f.hint}
          />
        </div>
      ))}

      {errorCount > 0 && (
        <div className="sm:col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Проверьте отмеченные поля — данные попадут в договор в таком виде.
        </div>
      )}

      <div className="sm:col-span-2 flex gap-2 mt-1">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
        >
          {saving ? "Сохраняем…" : "Сохранить реквизиты"}
        </button>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 px-2">
          Отмена
        </button>
      </div>
    </div>
  );
}
