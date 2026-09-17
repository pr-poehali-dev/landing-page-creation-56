import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Lead, STATUS_LABELS } from "./adminTypes";

interface UnpaidPanelProps {
  leads: Lead[];
  onOpenLead: (id: number) => void;
}

interface DebtRow {
  id: number;
  client: string;
  status: string;
  debt: number;
  paid: number;
  total: number;
  days: number;
  invoiceNo: string | null;
  invoiceUrl: string;
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / 86400000));
}

function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function daysLabel(d: number): string {
  if (d === 0) return "сегодня";
  if (d === 1) return "вчера";
  return `${d} ${plural(d, ["день", "дня", "дней"])} назад`;
}

export default function UnpaidPanel({ leads, onOpenLead }: UnpaidPanelProps) {
  const rows = useMemo<DebtRow[]>(() => {
    const result: DebtRow[] = [];
    leads.forEach(l => {
      if (l.status === "lost" || l.status === "completed") return;
      const total = l.totalPrice || 0;
      const paid = l.paidAmount || 0;
      const debt = total - paid;
      if (total <= 0 || debt <= 0) return;

      const invoices = l.documents
        .filter(d => d.type === "invoice" && d.createdAt)
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
      if (invoices.length === 0) return;

      const first = invoices[0];
      result.push({
        id: l.id,
        client: l.company || l.name,
        status: l.status,
        debt,
        paid,
        total,
        days: daysSince(first.createdAt!),
        invoiceNo: first.no,
        invoiceUrl: first.url,
      });
    });
    return result.sort((a, b) => b.days - a.days);
  }, [leads]);

  if (rows.length === 0) return null;

  const totalDebt = rows.reduce((s, r) => s + r.debt, 0);
  const overdue = rows.filter(r => r.days >= 7).length;

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm mb-4 overflow-hidden">
      <div className="px-5 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Icon name="Clock" size={19} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-base">Ждут оплаты</div>
            <div className="text-xs text-slate-600 mt-0.5">
              {rows.length} {plural(rows.length, ["сделка", "сделки", "сделок"])} на{" "}
              {totalDebt.toLocaleString("ru-RU")} ₽
              {overdue > 0 && <> · {overdue} дольше недели</>}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map(r => {
          const isOld = r.days >= 14;
          const isWarn = r.days >= 7 && r.days < 14;
          return (
            <div
              key={r.id}
              className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap hover:bg-slate-50 transition"
            >
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => onOpenLead(r.id)}
                  className="text-sm font-medium text-slate-900 hover:text-rose-600 transition text-left truncate block max-w-full"
                  title="Перейти к заявке"
                >
                  {r.client}
                </button>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      isOld
                        ? "bg-rose-100 text-rose-700"
                        : isWarn
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Счёт{r.invoiceNo ? ` № ${r.invoiceNo}` : ""} — {daysLabel(r.days)}
                  </span>
                  <span className="text-slate-400">{STATUS_LABELS[r.status] || r.status}</span>
                  {r.paid > 0 && (
                    <span className="text-slate-400">
                      внесено {r.paid.toLocaleString("ru-RU")} из {r.total.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400">долг</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {r.debt.toLocaleString("ru-RU")} ₽
                  </div>
                </div>
                <a
                  href={r.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Открыть счёт"
                  className="text-slate-400 hover:text-rose-600 transition p-1.5"
                >
                  <Icon name="Receipt" size={16} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
