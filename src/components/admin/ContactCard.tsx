import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Contact,
  FUNNEL_LABELS,
  FUNNEL_COLORS,
  RESULT_OPTIONS,
  dueLabel,
  formatTouch,
  phoneDigits,
} from "./contactTypes";

interface ContactCardProps {
  contact: Contact;
  onTouch: (id: number, payload: Record<string, unknown>) => Promise<void>;
  onCreateLead: (c: Contact) => Promise<void>;
}

export default function ContactCard({ contact: c, onTouch, onCreateLead }: ContactCardProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const due = dueLabel(c.nextTouchAt);

  async function handleResult(value: string) {
    const opt = RESULT_OPTIONS.find(o => o.value === value);
    if (!opt) return;
    setSaving(true);
    try {
      await onTouch(c.id, {
        result: opt.value,
        comment,
        funnelStatus: opt.status,
        nextInDays: opt.next || undefined,
        clearNext: opt.next === 0,
        priceSent: opt.value === "price_sent",
      });
      setComment("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateLead() {
    setCreating(true);
    try {
      await onCreateLead(c);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={`border rounded-xl p-3 transition ${due?.overdue ? "border-amber-300 bg-amber-50/40" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">{c.company}</span>
            {c.wasClient && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium flex items-center gap-0.5">
                <Icon name="Star" size={9} />
                был клиентом
              </span>
            )}
            <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${FUNNEL_COLORS[c.funnelStatus]}`}>
              {FUNNEL_LABELS[c.funnelStatus]}
            </span>
            {due && (
              <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${due.overdue ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                перезвон {due.text}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {c.industry && <span>{c.industry}</span>}
            {c.category && <span className="text-slate-400">{c.category}</span>}
            {c.city && <span>{c.city}</span>}
            <span className="text-slate-400">
              {c.touchCount > 0 ? `касаний: ${c.touchCount} · ${formatTouch(c.lastTouchAt)}` : "нет касаний"}
            </span>
          </div>
          {(c.phone || c.email) && (
            <div className="text-xs mt-1 flex flex-wrap gap-x-3">
              {c.phone && (
                <a href={`tel:${phoneDigits(c.phone)}`} className="text-rose-600 hover:underline">
                  {c.phone}
                </a>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-slate-500 hover:text-rose-600">
                  {c.email}
                </a>
              )}
              {c.site && (
                <a
                  href={c.site.startsWith("http") ? c.site : `https://${c.site.split(" ")[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-rose-600"
                >
                  сайт
                </a>
              )}
            </div>
          )}
          {c.note && <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.note}</div>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {c.phone && (
            <a
              href={`tel:${phoneDigits(c.phone)}`}
              title="Позвонить"
              className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition"
            >
              <Icon name="Phone" size={14} />
            </a>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            title="Отметить результат"
            className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 transition"
          >
            <Icon name={open ? "X" : "CheckCheck"} size={14} />
          </button>
          {c.leadId ? (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 rounded-lg px-2 py-1.5 font-medium whitespace-nowrap">
              заявка №{c.leadId}
            </span>
          ) : (
            <button
              onClick={handleCreateLead}
              disabled={creating}
              title="Создать заявку из контакта"
              className="text-xs border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition disabled:opacity-50 whitespace-nowrap"
            >
              {creating ? "…" : "В заявки"}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Комментарий к звонку"
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-rose-400 mb-2"
          />
          <div className="flex flex-wrap gap-1.5">
            {RESULT_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => handleResult(o.value)}
                disabled={saving}
                className="text-[11px] bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-full px-3 py-1.5 transition disabled:opacity-50"
              >
                {o.label}
                {o.next > 0 && <span className="opacity-60"> · +{o.next}д</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
