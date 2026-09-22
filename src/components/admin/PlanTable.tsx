import Icon from "@/components/ui/icon";
import { Placement, PAY_LABELS, PAY_COLORS, VIDEO_LABELS, money } from "./mediaPlanTypes";

interface PlanTableProps {
  items: Placement[];
  daysInMonth: number;
  capacity: number;
  load: number[];
}

export default function PlanTable({ items, daysInMonth, capacity, load }: PlanTableProps) {
  const totalAmount = items.reduce((s, i) => s + i.amountMonth, 0);
  const rest = load.map(l => Math.max(capacity - l, 0));

  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] border-collapse min-w-max">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left font-medium py-2 pr-2 sticky left-0 bg-white z-10 min-w-[170px]">
              Бренд / ролик
            </th>
            <th className="text-left font-medium py-2 px-2 min-w-[120px]">Плательщик</th>
            <th className="text-left font-medium py-2 px-2">Оплата</th>
            <th className="text-center font-medium py-2 px-2">Хрон.</th>
            <th className="text-left font-medium py-2 px-2">Ролик</th>
            <th className="text-center font-medium py-2 px-2">Дней</th>
            <th className="text-right font-medium py-2 px-2 whitespace-nowrap">Сумма, ₽</th>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <th key={i} className="font-medium py-2 w-6 text-center text-[9px] text-slate-400">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="py-1.5 pr-2 sticky left-0 bg-white hover:bg-slate-50 z-10">
                <div className="font-medium text-slate-900 truncate max-w-[170px]" title={it.brand}>
                  {it.brand}
                </div>
                {!!it.leadId && (
                  <div className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <Icon name="Link2" size={9} />
                    из сделки
                  </div>
                )}
                {it.agency && (
                  <div className="text-[10px] text-violet-600 truncate max-w-[170px] flex items-center gap-0.5">
                    <Icon name="Building2" size={9} />
                    {it.agency}
                  </div>
                )}
              </td>
              <td className="py-1.5 px-2 text-slate-600 truncate max-w-[130px]" title={it.legalEntity || ""}>
                {it.legalEntity || "—"}
              </td>
              <td className="py-1.5 px-2">
                <span className={`rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${PAY_COLORS[it.paymentType]}`}>
                  {PAY_LABELS[it.paymentType]}
                </span>
              </td>
              <td className="py-1.5 px-2 text-center text-slate-700 whitespace-nowrap">
                {it.durationSec ? `${it.durationSec}″` : "—"}
              </td>
              <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                {it.videoStatus === "production" ? (
                  <span className="text-amber-700">{VIDEO_LABELS[it.videoStatus]}</span>
                ) : (
                  VIDEO_LABELS[it.videoStatus]
                )}
              </td>
              <td className="py-1.5 px-2 text-center text-slate-700">{it.daysCount || "—"}</td>
              <td className="py-1.5 px-2 text-right font-semibold text-slate-900 whitespace-nowrap">
                {it.amountMonth ? money(it.amountMonth) : "—"}
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const sec = it.daySeconds[i] || 0;
                return (
                  <td
                    key={i}
                    title={sec ? `${it.brand}: ${sec} сек · ${i + 1} число` : ""}
                    className={`text-center w-6 text-[9px] ${
                      sec ? "bg-indigo-100 text-indigo-700 font-medium" : "text-slate-200"
                    }`}
                  >
                    {sec || "·"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 font-semibold text-slate-900 bg-slate-50">
            <td className="py-2 pr-2 sticky left-0 bg-slate-50 z-10">Итого загрузка</td>
            <td colSpan={5} />
            <td className="py-2 px-2 text-right whitespace-nowrap">{money(totalAmount)}</td>
            {load.map((sec, i) => (
              <td key={i} className="text-center text-[9px] w-6">
                {sec}
              </td>
            ))}
          </tr>
          <tr className="text-slate-500 bg-slate-50">
            <td className="py-1.5 pr-2 sticky left-0 bg-slate-50 z-10 font-medium">Остаток времени</td>
            <td colSpan={6} />
            {rest.map((sec, i) => (
              <td key={i} className="text-center text-[9px] w-6 text-emerald-700">
                {sec}
              </td>
            ))}
          </tr>
          <tr className="text-slate-500 bg-slate-50">
            <td className="py-1.5 pr-2 sticky left-0 bg-slate-50 z-10 font-medium">% заполнения</td>
            <td colSpan={6} />
            {load.map((sec, i) => {
              const pct = capacity ? Math.round((sec / capacity) * 100) : 0;
              return (
                <td
                  key={i}
                  className={`text-center text-[9px] w-6 ${pct >= 90 ? "text-rose-600 font-semibold" : ""}`}
                >
                  {pct}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
