import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";

interface ConsentBadgeProps {
  lead: Lead;
  formatDate: (iso: string | null) => string;
}

export default function ConsentBadge({ lead, formatDate }: ConsentBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!lead.consentAt) {
    if (lead.source === "manual") return null;
    return (
      <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <Icon name="TriangleAlert" size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <span>Согласие на обработку данных не зафиксировано — заявка создана до внедрения формы согласия.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Icon name="ShieldCheck" size={14} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-emerald-900">Согласие на обработку данных получено</div>
          <div className="text-xs text-emerald-700 mt-0.5">
            {formatDate(lead.consentAt)}
            {lead.consentIp && <> · IP {lead.consentIp}</>}
          </div>
          {lead.consentText && (
            <>
              <button
                onClick={() => setOpen(v => !v)}
                className="text-xs text-emerald-700 underline mt-1 hover:text-emerald-900 transition"
              >
                {open ? "Скрыть текст согласия" : "Показать текст согласия"}
              </button>
              {open && (
                <div className="mt-2 bg-white border border-emerald-200 rounded-md p-2 text-xs text-slate-600 leading-relaxed">
                  {lead.consentText}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
