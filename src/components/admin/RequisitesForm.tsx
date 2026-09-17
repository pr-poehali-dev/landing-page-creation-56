import { Requisites } from "./adminTypes";

interface RequisitesFormProps {
  form: Requisites;
  setForm: (r: Requisites) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400";
const labelCls = "text-xs font-medium text-slate-500 block mb-1";

const FIELDS: { key: keyof Requisites; label: string; wide?: boolean; placeholder?: string; type?: string }[] = [
  { key: "company", label: "Организация / ИП", wide: true, placeholder: "ООО «Компания»" },
  { key: "email", label: "Email для отправки документов", wide: true, placeholder: "client@company.ru", type: "email" },
  { key: "inn", label: "ИНН" },
  { key: "kpp", label: "КПП" },
  { key: "ogrn", label: "ОГРН / ОГРНИП", wide: true },
  { key: "legalAddress", label: "Юридический адрес", wide: true },
  { key: "bankName", label: "Банк", wide: true },
  { key: "bankAccount", label: "Р/с" },
  { key: "bankBik", label: "БИК" },
  { key: "bankCorrAccount", label: "Корр. счёт", wide: true },
  { key: "signerName", label: "ФИО подписанта", placeholder: "Иванов Иван Иванович" },
  { key: "signerPosition", label: "Должность", placeholder: "Директор" },
];

export default function RequisitesForm({ form, setForm, onSave, onCancel, saving }: RequisitesFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FIELDS.map(f => (
        <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
          <label className={labelCls}>{f.label}</label>
          <input
            type={f.type || "text"}
            value={form[f.key]}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className={inputCls}
          />
        </div>
      ))}

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
