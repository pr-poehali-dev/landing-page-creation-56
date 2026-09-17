import { useState } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";
import ValidatedInput from "./ValidatedInput";
import { validatePhone, validateEmail, formatPhone } from "./validation";

interface NewLeadFormProps {
  onCreated: (lead: Lead) => void;
}

const EMPTY = {
  name: "",
  phone: "",
  company: "",
  email: "",
  comment: "",
  totalPrice: "",
  duration: "",
  days: "",
  needVideo: false,
};

export default function NewLeadForm({ onCreated }: NewLeadFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const phoneError = validatePhone(form.phone);
  const emailError = validateEmail(form.email);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Имя и телефон обязательны");
      setTouched({ phone: true, email: true });
      return;
    }
    if (phoneError || emailError) {
      setTouched({ phone: true, email: true });
      setError("Проверьте отмеченные поля");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(func2url.leads, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          comment: form.comment.trim(),
          totalPrice: form.totalPrice ? Number(form.totalPrice) : null,
          duration: form.duration ? Number(form.duration) : null,
          days: form.days ? Number(form.days) : null,
          needVideo: form.needVideo,
          source: "manual",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить заявку");

      onCreated({
        id: data.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        comment: form.comment.trim() || null,
        duration: form.duration ? Number(form.duration) : null,
        days: form.days ? Number(form.days) : null,
        needVideo: form.needVideo,
        totalPrice: form.totalPrice ? Number(form.totalPrice) : null,
        source: "manual",
        status: "new",
        createdAt: new Date().toISOString(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        startDate: null,
        endDate: null,
        placementAmount: null,
        videoAmount: null,
        inn: null,
        kpp: null,
        ogrn: null,
        legalAddress: null,
        bankName: null,
        bankAccount: null,
        bankBik: null,
        bankCorrAccount: null,
        signerName: null,
        signerPosition: null,
        paidAmount: 0,
        documents: [],
        events: [{ type: "created", details: "Добавлена вручную", createdAt: new Date().toISOString() }],
      });
      setForm(EMPTY);
      setTouched({});
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400 transition";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <Icon name="PhoneCall" size={18} className="text-rose-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-sm">Добавить заявку вручную</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Клиент позвонил или написал — внесите его сюда
            </div>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "Plus"} size={18} className="text-slate-400" />
      </button>

      {open && (
        <form onSubmit={submit} className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Имя клиента *</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Иван Петров"
                className={inputClass}
              />
            </div>
            <ValidatedInput
              label="Телефон *"
              value={form.phone}
              onChange={v => set("phone", v)}
              onBlur={() => {
                setTouched(t => ({ ...t, phone: true }));
                if (!validatePhone(form.phone)) set("phone", formatPhone(form.phone));
              }}
              error={touched.phone ? phoneError : null}
              placeholder="+7 900 111-22-33"
              inputMode="tel"
            />
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Организация</label>
              <input
                value={form.company}
                onChange={e => set("company", e.target.value)}
                placeholder="ООО «Ромашка»"
                className={inputClass}
              />
            </div>
            <ValidatedInput
              label="Email для документов"
              value={form.email}
              onChange={v => set("email", v)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              error={touched.email ? emailError : null}
              placeholder="client@company.ru"
              type="email"
              inputMode="email"
            />
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Стоимость, ₽</label>
              <input
                type="number"
                min={0}
                value={form.totalPrice}
                onChange={e => set("totalPrice", e.target.value)}
                placeholder="50000"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Хронометраж, сек</label>
                <input
                  type="number"
                  min={0}
                  value={form.duration}
                  onChange={e => set("duration", e.target.value)}
                  placeholder="10"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Дней</label>
                <input
                  type="number"
                  min={0}
                  value={form.days}
                  onChange={e => set("days", e.target.value)}
                  placeholder="14"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
              <textarea
                value={form.comment}
                onChange={e => set("comment", e.target.value)}
                placeholder="О чём договорились по телефону"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.needVideo}
                onChange={e => set("needVideo", e.target.checked)}
                className="w-4 h-4 accent-rose-600"
              />
              Нужно изготовить ролик
            </label>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2 mt-3">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium rounded-xl px-4 py-2.5 flex items-center gap-2 transition"
            >
              <Icon name={saving ? "Loader2" : "Check"} size={15} className={saving ? "animate-spin" : ""} />
              {saving ? "Сохраняем…" : "Создать заявку"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 transition"
            >
              Отмена
            </button>
            <span className="text-xs text-slate-400 ml-auto hidden sm:block">
              Остальные данные добавите потом в карточке
            </span>
          </div>
        </form>
      )}
    </div>
  );
}