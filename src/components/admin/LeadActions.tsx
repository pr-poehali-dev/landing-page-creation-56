import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";

interface LeadActionsProps {
  lead: Lead;
  openRequisites: (l: Lead) => void;
  openDealTerms: (l: Lead) => void;
  generateContract: (id: number) => void;
  generatingId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
}

interface Action {
  key: string;
  label: string;
  icon: string;
  run: () => void;
  disabled?: boolean;
  hint?: string;
  danger?: boolean;
}

export default function LeadActions({
  lead: l,
  openRequisites,
  openDealTerms,
  generateContract,
  generatingId,
  setConfirmDeleteId,
}: LeadActionsProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const hasRequisites = Boolean(l.inn || l.legalAddress);
  const hasContract = l.documents.some(d => d.type === "contract");
  const busy = generatingId === l.id;

  const actions: Record<string, Action> = {
    terms: {
      key: "terms",
      label: l.totalPrice ? "Изменить условия" : "Указать условия",
      icon: "CalendarRange",
      run: () => openDealTerms(l),
    },
    requisites: {
      key: "requisites",
      label: l.inn ? "Реквизиты клиента" : "Добавить реквизиты",
      icon: "FileText",
      run: () => openRequisites(l),
    },
    contract: {
      key: "contract",
      label: busy ? "Формируем…" : hasContract ? "Сформировать ещё договор" : "Сформировать договор",
      icon: "FileSignature",
      run: () => generateContract(l.id),
      disabled: busy || !hasRequisites,
      hint: !hasRequisites ? "Сначала заполните реквизиты клиента" : undefined,
    },
  };

  const primaryKey = !l.totalPrice
    ? "terms"
    : !hasRequisites
    ? "requisites"
    : !hasContract
    ? "contract"
    : "";

  const primary = primaryKey ? actions[primaryKey] : null;
  const rest = Object.values(actions).filter(a => a.key !== primaryKey);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {primary ? (
        <button
          onClick={primary.run}
          disabled={primary.disabled}
          title={primary.hint}
          className="text-sm bg-rose-600 text-white rounded-lg px-4 py-2 hover:bg-rose-700 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name={primary.icon} size={15} />
          {primary.label}
        </button>
      ) : (
        <a
          href={`tel:${l.phone.replace(/\D/g, "")}`}
          className="text-sm bg-rose-600 text-white rounded-lg px-4 py-2 hover:bg-rose-700 transition flex items-center gap-1.5"
        >
          <Icon name="Phone" size={15} />
          Позвонить
        </a>
      )}

      {primary && (
        <a
          href={`tel:${l.phone.replace(/\D/g, "")}`}
          title="Позвонить клиенту"
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-100 transition flex items-center gap-1.5"
        >
          <Icon name="Phone" size={15} />
        </a>
      )}

      <a
        href="https://t.me/izumrudvlpm"
        target="_blank"
        rel="noopener noreferrer"
        title="Написать в Telegram"
        className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-100 transition flex items-center"
      >
        <Icon name="Send" size={15} />
      </a>

      <div className="relative" ref={boxRef}>
        <button
          onClick={() => setOpen(v => !v)}
          title="Ещё действия"
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-100 transition flex items-center gap-1"
        >
          <Icon name="Ellipsis" size={15} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[230px]">
            {rest.map(a => (
              <button
                key={a.key}
                disabled={a.disabled}
                title={a.hint}
                onClick={() => {
                  a.run();
                  setOpen(false);
                }}
                className="w-full text-left text-sm px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name={a.icon} size={15} className="text-slate-400 shrink-0" />
                {a.label}
              </button>
            ))}
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={() => {
                setConfirmDeleteId(l.id);
                setOpen(false);
              }}
              className="w-full text-left text-sm px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition"
            >
              <Icon name="Trash2" size={15} className="shrink-0" />
              Удалить заявку
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
