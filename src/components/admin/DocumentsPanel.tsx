import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";

interface DocRow {
  id: number | null;
  leadId: number;
  client: string;
  type: string;
  no: string | null;
  url: string;
  createdAt: string | null;
}

const DOC_LABELS: Record<string, string> = {
  contract: "Договор",
  invoice: "Счёт",
  act: "Акт",
};

const DOC_ICONS: Record<string, string> = {
  contract: "FileSignature",
  invoice: "Receipt",
  act: "ClipboardCheck",
};

const DOC_COLORS: Record<string, string> = {
  contract: "bg-blue-50 text-blue-600",
  invoice: "bg-purple-50 text-purple-600",
  act: "bg-emerald-50 text-emerald-600",
};

interface DocumentsPanelProps {
  leads: Lead[];
  formatDate: (iso: string | null) => string;
}

export default function DocumentsPanel({ leads, formatDate }: DocumentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const allDocs = useMemo<DocRow[]>(() => {
    const rows: DocRow[] = [];
    leads.forEach(l => {
      l.documents.forEach(d => {
        rows.push({
          id: d.id,
          leadId: l.id,
          client: l.company || l.name,
          type: d.type,
          no: d.no,
          url: d.url,
          createdAt: d.createdAt,
        });
      });
    });
    return rows.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [leads]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allDocs.length, contract: 0, invoice: 0, act: 0 };
    allDocs.forEach(d => { c[d.type] = (c[d.type] || 0) + 1; });
    return c;
  }, [allDocs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allDocs.filter(d => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (q && !d.client.toLowerCase().includes(q) && !String(d.no || "").includes(q)) return false;
      return true;
    });
  }, [allDocs, typeFilter, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Icon name="FolderOpen" size={18} className="text-blue-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-sm">Все документы</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {counts.all === 0
                ? "Документов пока нет"
                : `${counts.all} файлов · договоров ${counts.contract}, счетов ${counts.invoice}, актов ${counts.act}`}
            </div>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-slate-400" />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {[
              { key: "all", label: `Все (${counts.all})` },
              { key: "contract", label: `Договоры (${counts.contract})` },
              { key: "invoice", label: `Счета (${counts.invoice})` },
              { key: "act", label: `Акты (${counts.act})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${
                  typeFilter === t.key
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="relative ml-auto">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по клиенту или номеру"
                className="text-xs border border-slate-200 rounded-full pl-8 pr-3 py-2 w-60 outline-none focus:border-slate-400 transition"
              />
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-sm text-slate-400 py-4 text-center">
              {counts.all === 0 ? "Документы появятся здесь после формирования" : "Ничего не найдено"}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filtered.map((d, i) => (
                <div
                  key={`${d.id}-${i}`}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${DOC_COLORS[d.type] || "bg-slate-100 text-slate-600"}`}>
                    <Icon name={DOC_ICONS[d.type] || "File"} size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {DOC_LABELS[d.type] || d.type}
                      {d.no ? ` № ${d.no}` : ""} — {d.client}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Заявка №{d.leadId}
                      {d.createdAt ? ` · ${formatDate(d.createdAt)}` : ""}
                    </div>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg px-3 py-2 flex items-center gap-1.5 transition"
                  >
                    <Icon name="ExternalLink" size={13} />
                    Открыть
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
