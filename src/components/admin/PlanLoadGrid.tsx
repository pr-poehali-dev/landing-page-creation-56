import { Placement, money } from "./mediaPlanTypes";

interface PlanLoadGridProps {
  items: Placement[];
  load: number[];
  capacity: number;
  daysInMonth: number;
}

function loadColor(pct: number) {
  if (pct >= 0.9) return "bg-rose-500";
  if (pct >= 0.7) return "bg-amber-500";
  if (pct >= 0.4) return "bg-emerald-500";
  return "bg-emerald-300";
}

export default function PlanLoadGrid({ items, load, capacity, daysInMonth }: PlanLoadGridProps) {
  const totalCapacity = capacity * daysInMonth;
  const totalLoad = load.reduce((s, x) => s + x, 0);
  const avgPct = totalCapacity > 0 ? totalLoad / totalCapacity : 0;
  const peak = Math.max(...load, 0);

  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="text-xs font-medium text-slate-600">
          Загрузка экрана · ёмкость {capacity} сек/день
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            Средняя загрузка <b className="text-slate-900">{Math.round(avgPct * 100)}%</b>
          </span>
          <span className="text-slate-500">
            Пик <b className="text-slate-900">{peak} сек</b>
          </span>
          <span className="text-slate-500">
            Свободно <b className="text-emerald-700">{money(totalCapacity - totalLoad)} сек</b>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex gap-[2px] items-end h-24">
            {load.map((sec, i) => {
              const pct = capacity > 0 ? sec / capacity : 0;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end h-full" title={`${i + 1} число: ${sec} из ${capacity} сек (${Math.round(pct * 100)}%)`}>
                  <div
                    className={`${loadColor(pct)} rounded-t-[2px] transition-all`}
                    style={{ height: `${Math.min(100, pct * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-[2px] mt-1">
            {load.map((_, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-400">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex gap-[2px] mt-1">
            {load.map((sec, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-500 font-medium">
                {sec || ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-[3px] bg-emerald-300 inline-block" /> до 40%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-[3px] bg-emerald-500 inline-block" /> 40–70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-[3px] bg-amber-500 inline-block" /> 70–90%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-[3px] bg-rose-500 inline-block" /> заполнено
        </span>
        <span className="ml-auto text-slate-400">{items.length} роликов в месяце</span>
      </div>
    </div>
  );
}
