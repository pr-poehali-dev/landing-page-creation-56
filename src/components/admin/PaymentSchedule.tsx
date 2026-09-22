import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Lead, LeadPayment } from "./adminTypes";

interface PaymentScheduleProps {
  lead: Lead;
  savePayments: (leadId: number, rows: LeadPayment[]) => Promise<void>;
}

function money(n: number) {
  return n.toLocaleString("ru-RU");
}

function fmtDay(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysLeft(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function dueLabel(iso: string, isPaid: boolean) {
  if (isPaid) return { text: "оплачен", cls: "bg-emerald-100 text-emerald-700" };
  const d = daysLeft(iso);
  if (d < 0) return { text: `просрочен на ${Math.abs(d)} дн.`, cls: "bg-rose-100 text-rose-700" };
  if (d === 0) return { text: "сегодня", cls: "bg-amber-100 text-amber-700" };
  if (d <= 3) return { text: `через ${d} дн.`, cls: "bg-amber-100 text-amber-700" };
  return { text: `через ${d} дн.`, cls: "bg-slate-100 text-slate-600" };
}

export default function PaymentSchedule({ lead, savePayments }: PaymentScheduleProps) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<LeadPayment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const payments = lead.payments || [];
  const planned = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter(p => p.isPaid).reduce((s, p) => s + p.amount, 0);
  const total = lead.totalPrice || 0;

  function startEdit() {
    setRows(payments.length > 0 ? payments.map(p => ({ ...p })) : [blankRow()]);
    setError("");
    setEditing(true);
  }

  function blankRow(): LeadPayment {
    return { id: null, dueDate: "", amount: 0, comment: null, isPaid: false, paidAt: null };
  }

  function update(i: number, patch: Partial<LeadPayment>) {
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function splitHalf() {
    const base = total || planned;
    if (!base) return;
    const first = Math.round(base / 2);
    setRows([
      { id: null, dueDate: lead.startDate || "", amount: first, comment: "предоплата 50%", isPaid: false, paidAt: null },
      { id: null, dueDate: lead.endDate || "", amount: base - first, comment: "окончательный расчёт", isPaid: false, paidAt: null },
    ]);
  }

  async function handleSave() {
    const clean = rows.filter(r => r.dueDate && r.amount > 0);
    if (rows.length > 0 && clean.length === 0) {
      setError("Заполните дату и сумму хотя бы одного платежа");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await savePayments(lead.id, clean);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить график");
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(index: number) {
    const next = payments.map((p, i) => (i === index ? { ...p, isPaid: !p.isPaid } : p));
    await savePayments(lead.id, next);
  }

  if (editing) {
    const sum = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const diff = total ? total - sum : 0;
    return (
      <div className="mt-3 bg-slate-50 rounded-lg p-3">
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <Icon name="CalendarClock" size={13} className="text-slate-400" />
          График платежей
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={r.dueDate || ""}
                onChange={e => update(i, { dueDate: e.target.value })}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-rose-400 bg-white"
              />
              <input
                type="number"
                min={0}
                value={r.amount || ""}
                onChange={e => update(i, { amount: Number(e.target.value) || 0 })}
                placeholder="Сумма, ₽"
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 w-32 outline-none focus:border-rose-400 bg-white"
              />
              <input
                type="text"
                value={r.comment || ""}
                onChange={e => update(i, { comment: e.target.value })}
                placeholder="Комментарий"
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 flex-1 min-w-[120px] outline-none focus:border-rose-400 bg-white"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.isPaid}
                  onChange={e => update(i, { isPaid: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                оплачен
              </label>
              <button
                onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                title="Удалить строку"
                className="text-slate-300 hover:text-rose-600 transition"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => setRows(prev => [...prev, blankRow()])}
            className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition"
          >
            <Icon name="Plus" size={13} />
            Добавить платёж
          </button>
          {total > 0 && (
            <button
              onClick={splitHalf}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 transition"
            >
              <Icon name="Split" size={13} />
              Разбить 50 / 50
            </button>
          )}
        </div>

        {total > 0 && (
          <div className={`mt-2 text-xs ${diff === 0 ? "text-slate-500" : "text-amber-700"}`}>
            Сумма платежей {money(sum)} ₽ из {money(total)} ₽
            {diff > 0 && <> · не распределено {money(diff)} ₽</>}
            {diff < 0 && <> · превышение на {money(-diff)} ₽</>}
          </div>
        )}

        {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition disabled:opacity-50"
          >
            {saving ? "Сохраняем…" : "Сохранить график"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="mt-3">
        <button
          onClick={startEdit}
          className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5"
        >
          <Icon name="CalendarClock" size={13} />
          Составить график платежей
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-slate-50 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Icon name="CalendarClock" size={13} className="text-slate-400" />
          График платежей
        </div>
        <button
          onClick={startEdit}
          className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
        >
          <Icon name="Pencil" size={12} />
          Изменить
        </button>
      </div>

      <div className="space-y-1.5">
        {payments.map((p, i) => {
          const label = dueLabel(p.dueDate, p.isPaid);
          return (
            <div key={p.id ?? i} className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => togglePaid(i)}
                title={p.isPaid ? "Отменить отметку об оплате" : "Отметить оплаченным"}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                  p.isPaid
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-slate-300 text-transparent hover:border-emerald-400"
                }`}
              >
                <Icon name="Check" size={13} />
              </button>
              <span className={`text-sm font-medium ${p.isPaid ? "text-slate-400 line-through" : "text-slate-900"}`}>
                {money(p.amount)} ₽
              </span>
              <span className="text-xs text-slate-500">до {fmtDay(p.dueDate)}</span>
              <span className={`text-[11px] rounded-full px-2 py-0.5 font-medium ${label.cls}`}>
                {label.text}
              </span>
              {p.comment && <span className="text-xs text-slate-400 truncate">{p.comment}</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
        Оплачено {money(paid)} ₽ из {money(planned)} ₽ по графику
        {total > 0 && planned !== total && (
          <span className="text-amber-700"> · сумма сделки {money(total)} ₽</span>
        )}
      </div>
    </div>
  );
}
