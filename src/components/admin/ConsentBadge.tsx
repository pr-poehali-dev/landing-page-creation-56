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
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1.5"
      >
        <Icon name="ShieldCheck" size={13} className="text-emerald-600" />
        Согласие получено {formatDate(lead.consentAt)}
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={12} className="text-emerald-500" />
      </button>
      {open && (
        <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 leading-relaxed">
          {lead.consentIp && <div className="text-emerald-700 mb-1">IP {lead.consentIp}</div>}
          {lead.consentText}
        </div>
      )}
    </div>
  );
}
