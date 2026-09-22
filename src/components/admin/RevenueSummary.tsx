import { MONTHS_RU, PlanTotal, RevenueFact, money } from "./mediaPlanTypes";

interface RevenueSummaryProps {
  revenue: RevenueFact[];
  planTotals: PlanTotal[];
}

export default function RevenueSummary({ revenue, planTotals }: RevenueSummaryProps) {
  const years = Array.from(
    new Set([...revenue.map(r => r.year), ...planTotals.map(p => p.year)])
  ).sort();

  function cell(year: number, month: number): number {
    const fact = revenue.find(r => r.year === year && r.month === month);
    if (fact) return fact.amount;
    const plan = planTotals.find(p => p.year === year && p.month === month);
    return plan ? plan.amount : 0;
  }

  const yearTotals = years.map(y =>
    Array.from({ length: 12 }, (_, i) => cell(y, i + 1)).reduce((s, x) => s + x, 0)
  );
  const grand = yearTotals.reduce((s, x) => s + x, 0);
  const maxVal = Math.max(
    ...years.flatMap(y => Array.from({ length: 12 }, (_, i) => cell(y, i + 1))),
    1
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[520px]">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left font-medium py-2 pr-3">Месяц</th>
            {years.map(y => (
              <th key={y} className="text-right font-medium py-2 px-3">
                {y}
              </th>
            ))}
            <th className="text-right font-medium py-2 pl-3 w-24">Динамика</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
            const vals = years.map(y => cell(y, m));
            const last = vals[vals.length - 1];
            const prev = vals.length > 1 ? vals[vals.length - 2] : 0;
            const growth = prev > 0 && last > 0 ? Math.round(((last - prev) / prev) * 100) : null;
            return (
              <tr key={m} className="border-t border-slate-100">
                <td className="py-1.5 pr-3 text-slate-700">{MONTHS_RU[m]}</td>
                {vals.map((v, idx) => (
                  <td key={idx} className="py-1.5 px-3 text-right text-slate-700">
                    {v ? money(v) : "—"}
                  </td>
                ))}
                <td className="py-1.5 pl-3 text-right">
                  {growth === null ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <span className={growth >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                      {growth >= 0 ? "+" : ""}
                      {growth}%
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 font-semibold text-slate-900">
            <td className="py-2 pr-3">Итого за год</td>
            {yearTotals.map((t, i) => (
              <td key={i} className="py-2 px-3 text-right">
                {money(t)}
              </td>
            ))}
            <td />
          </tr>
          <tr className="text-slate-500">
            <td className="py-1.5 pr-3">Средний месяц</td>
            {yearTotals.map((t, i) => {
              const filled = Array.from({ length: 12 }, (_, m) => cell(years[i], m + 1)).filter(Boolean).length;
              return (
                <td key={i} className="py-1.5 px-3 text-right">
                  {filled ? money(t / filled) : "—"}
                </td>
              );
            })}
            <td />
          </tr>
        </tfoot>
      </table>

      <div className="mt-3 flex items-end gap-[3px] h-20">
        {years.flatMap(y =>
          Array.from({ length: 12 }, (_, i) => {
            const v = cell(y, i + 1);
            return (
              <div
                key={`${y}-${i}`}
                title={`${MONTHS_RU[i + 1]} ${y}: ${money(v)} ₽`}
                className="flex-1 bg-indigo-400 hover:bg-indigo-600 rounded-t-[2px] transition-colors min-w-[3px]"
                style={{ height: `${Math.max(2, (v / maxVal) * 100)}%` }}
              />
            );
          })
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-sm font-semibold text-slate-900">
        <span>Всего за все годы</span>
        <span>{money(grand)} ₽</span>
      </div>
    </div>
  );
}
