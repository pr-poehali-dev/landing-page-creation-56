import Icon from "@/components/ui/icon";
import { LeadPayment } from "./adminTypes";

interface PaymentRowsEditorProps {
  rows: LeadPayment[];
  setRows: (rows: LeadPayment[]) => void;
  total: number;
  startDate: string;
  endDate: string;
}

export function blankPayment(): LeadPayment {
  return { id: null, dueDate: "", amount: 0, comment: null, isPaid: false, paidAt: null };
}

export default function PaymentRowsEditor({
  rows,
  setRows,
  total,
  startDate,
  endDate,
}: PaymentRowsEditorProps) {
  const sum = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const diff = total ? total - sum : 0;

  function update(i: number, patch: Partial<LeadPayment>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function splitHalf() {
    const base = total || sum;
    if (!base) return;
    const first = Math.round(base / 2);
    setRows([
      { id: null, dueDate: startDate || "", amount: first, comment: "предоплата 50%", isPaid: false, paidAt: null },
      { id: null, dueDate: endDate || "", amount: base - first, comment: "окончательный расчёт", isPaid: false, paidAt: null },
    ]);
  }

  function fullPrepay() {
    const base = total || sum;
    if (!base) return;
    setRows([
      { id: null, dueDate: startDate || "", amount: base, comment: "100% предоплата", isPaid: false, paidAt: null },
    ]);
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
        <Icon name="CalendarClock" size={13} className="text-slate-400" />
        График платежей
        <span className="font-normal text-slate-400">· попадёт в договор</span>
      </div>

      {rows.length === 0 && (
        <div className="text-xs text-slate-400 mb-2">
          Платежи не заданы — в договоре останется общая формулировка об оплате по счёту.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={r.dueDate || ""}
              onChange={e => update(i, { dueDate: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-rose-400"
            />
            <input
              type="number"
              min={0}
              value={r.amount || ""}
              onChange={e => update(i, { amount: Number(e.target.value) || 0 })}
              placeholder="Сумма, ₽"
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 w-28 outline-none focus:border-rose-400"
            />
            <input
              type="text"
              value={r.comment || ""}
              onChange={e => update(i, { comment: e.target.value })}
              placeholder="Комментарий"
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 flex-1 min-w-[110px] outline-none focus:border-rose-400"
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
              type="button"
              onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
              title="Удалить платёж"
              className="text-slate-300 hover:text-rose-600 transition"
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setRows([...rows, blankPayment()])}
          className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition"
        >
          <Icon name="Plus" size={13} />
          Добавить платёж
        </button>
        {total > 0 && (
          <>
            <button
              type="button"
              onClick={splitHalf}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 transition"
            >
              <Icon name="Split" size={13} />
              50 / 50
            </button>
            <button
              type="button"
              onClick={fullPrepay}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 transition"
            >
              <Icon name="Wallet" size={13} />
              100% вперёд
            </button>
          </>
        )}
      </div>

      {rows.length > 0 && total > 0 && (
        <div className={`mt-2 text-xs ${diff === 0 ? "text-slate-500" : "text-amber-700"}`}>
          Платежи на {sum.toLocaleString("ru-RU")} ₽ из {total.toLocaleString("ru-RU")} ₽
          {diff > 0 && <> · не распределено {diff.toLocaleString("ru-RU")} ₽</>}
          {diff < 0 && <> · превышение на {(-diff).toLocaleString("ru-RU")} ₽</>}
        </div>
      )}
    </div>
  );
}
