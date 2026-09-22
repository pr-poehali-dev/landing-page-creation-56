import Icon from "@/components/ui/icon";
import { Lead, LeadPayment } from "./adminTypes";

interface PaymentScheduleProps {
  lead: Lead;
  savePayments: (leadId: number, rows: LeadPayment[]) => Promise<void>;
  openDealTerms: (l: Lead) => void;
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

export default function PaymentSchedule({ lead, savePayments, openDealTerms }: PaymentScheduleProps) {
  const payments = lead.payments || [];
  const planned = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter(p => p.isPaid).reduce((s, p) => s + p.amount, 0);
  const total = lead.totalPrice || 0;

  async function togglePaid(index: number) {
    const next = payments.map((p, i) => (i === index ? { ...p, isPaid: !p.isPaid } : p));
    await savePayments(lead.id, next);
  }

  if (payments.length === 0) {
    return (
      <div className="mt-3">
        <button
          onClick={() => openDealTerms(lead)}
          className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5"
        >
          <Icon name="CalendarClock" size={13} />
          Задать график платежей
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
          onClick={() => openDealTerms(lead)}
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
