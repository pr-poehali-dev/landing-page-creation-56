import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";
import { getMissingFields, getSuspiciousFields } from "./leadReadinessUtils";

interface LeadReadinessProps {
  lead: Lead;
  openRequisites: (l: Lead) => void;
  openDealTerms: (l: Lead) => void;
}

export default function LeadReadiness({ lead, openRequisites, openDealTerms }: LeadReadinessProps) {
  const missing = getMissingFields(lead);
  const suspicious = getSuspiciousFields(lead);

  const suspiciousBlock = suspicious.length > 0 && (
    <div className="mt-3 rounded-lg px-3 py-2.5 border text-xs bg-orange-50 border-orange-200 text-orange-900">
      <div className="flex items-start gap-2">
        <Icon name="CircleAlert" size={14} className="shrink-0 mt-0.5 text-orange-600" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">Проверьте данные — возможна опечатка</div>
          <ul className="mt-1.5 space-y-1">
            {suspicious.map(s => (
              <li key={s.label} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-orange-400">•</span>
                <span className="font-medium">{s.label}:</span>
                <span className="opacity-80">{s.problem}</span>
              </li>
            ))}
          </ul>
          {suspicious.some(s => s.inRequisites) && (
            <button
              onClick={() => openRequisites(lead)}
              className="mt-2 inline-flex items-center gap-1 font-medium text-orange-700 hover:text-orange-900 transition"
            >
              <Icon name="Pencil" size={12} />
              Исправить реквизиты
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (missing.length === 0) {
    return (
      <>
        {suspicious.length === 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <Icon name="CircleCheck" size={14} className="shrink-0" />
            Все данные заполнены — договор сформируется полностью
          </div>
        )}
        {suspiciousBlock}
      </>
    );
  }

  const isBlocking =
    missing.some(m => m.label.startsWith("реквизиты"));
  const hasRequisiteGaps = missing.some(m => m.inRequisites);
  const hasTermGaps = missing.some(m => !m.inRequisites);

  return (
    <>
    <div
      className={`mt-3 rounded-lg px-3 py-2.5 border text-xs ${
        isBlocking
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-slate-50 border-slate-200 text-slate-600"
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon
          name={isBlocking ? "TriangleAlert" : "Info"}
          size={14}
          className={`shrink-0 mt-0.5 ${isBlocking ? "text-amber-600" : "text-slate-400"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {isBlocking ? "Не хватает данных для договора" : "Договор сформируется не полностью"}
          </div>
          <ul className="mt-1.5 space-y-1">
            {missing.map(m => (
              <li key={m.label} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-slate-400">•</span>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-3">
            {hasRequisiteGaps && (
              <button
                onClick={() => openRequisites(lead)}
                className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700 transition"
              >
                <Icon name="Pencil" size={12} />
                Заполнить реквизиты
              </button>
            )}
            {hasTermGaps && (
              <button
                onClick={() => openDealTerms(lead)}
                className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700 transition"
              >
                <Icon name="CalendarRange" size={12} />
                Указать условия размещения
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    {suspiciousBlock}
    </>
  );
}