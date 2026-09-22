import { useState, useEffect, useMemo } from "react";
import func2url from "../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminToolbar from "@/components/admin/AdminToolbar";
import LeadCard from "@/components/admin/LeadCard";
import BackupPanel from "@/components/admin/BackupPanel";
import HelpPanel from "@/components/admin/HelpPanel";
import NewLeadForm from "@/components/admin/NewLeadForm";
import UnpaidPanel from "@/components/admin/UnpaidPanel";
import StatsPanel from "@/components/admin/StatsPanel";
import AdminModal from "@/components/admin/AdminModal";
import RequisitesForm from "@/components/admin/RequisitesForm";
import DealTermsForm from "@/components/admin/DealTermsForm";
import {
  Lead,
  LeadDocument,
  LeadPayment,
  Requisites,
  EMPTY_REQUISITES,
  DealTerms,
  EMPTY_DEAL_TERMS,
  STATUS_ORDER,
  STATUS_LABELS,
  ACTIVE_STATUSES,
} from "@/components/admin/adminTypes";

const PAGE_SIZE = 20;

const DOC_NAMES: Record<string, string> = { contract: "Договор", invoice: "Счёт", act: "Акт" };

function docEventLabel(doc: LeadDocument): string {
  return `${DOC_NAMES[doc.type] || "Документ"}${doc.no ? ` № ${doc.no}` : ""}`;
}

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [adminKey, setAdminKey] = useState<string | null>(() => localStorage.getItem("fb-admin-key"));
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reqForm, setReqForm] = useState<Requisites>(EMPTY_REQUISITES);
  const [savingReq, setSavingReq] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [contractError, setContractError] = useState<Record<number, string>>({});
  const [editingTermsId, setEditingTermsId] = useState<number | null>(null);
  const [termsForm, setTermsForm] = useState<DealTerms>(EMPTY_DEAL_TERMS);
  const [savingTerms, setSavingTerms] = useState(false);
  const [editingPaidId, setEditingPaidId] = useState<number | null>(null);
  const [paidInput, setPaidInput] = useState("");
  const [savingPaid, setSavingPaid] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, statusFilter, sortBy]);

  const editingLead = leads.find(l => l.id === editingId) || null;
  const termsLead = leads.find(l => l.id === editingTermsId) || null;

  useEffect(() => {
    if (!adminKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(func2url.leads, { headers: { "X-Admin-Key": adminKey } })
      .then(r => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      })
      .then(d => setLeads(d.leads || []))
      .catch(err => {
        if (err.message === "forbidden") {
          localStorage.removeItem("fb-admin-key");
          setAdminKey(null);
          setAuthError("Неверный пароль");
        } else {
          setError("Не удалось загрузить заявки");
        }
      })
      .finally(() => setLoading(false));
  }, [adminKey]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setChecking(true);
    fetch(func2url.leads, { headers: { "X-Admin-Key": keyInput } })
      .then(r => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      })
      .then(d => {
        localStorage.setItem("fb-admin-key", keyInput);
        setAdminKey(keyInput);
        setLeads(d.leads || []);
      })
      .catch(() => setAuthError("Неверный пароль"))
      .finally(() => setChecking(false));
  }

  function handleLogout() {
    localStorage.removeItem("fb-admin-key");
    setAdminKey(null);
    setKeyInput("");
    setLeads([]);
  }

  function openRequisites(l: Lead) {
    setEditingId(l.id);
    setReqForm({
      company: l.company || "",
      email: l.email || "",
      inn: l.inn || "",
      kpp: l.kpp || "",
      ogrn: l.ogrn || "",
      legalAddress: l.legalAddress || "",
      bankName: l.bankName || "",
      bankAccount: l.bankAccount || "",
      bankBik: l.bankBik || "",
      bankCorrAccount: l.bankCorrAccount || "",
      signerName: l.signerName || "",
      signerPosition: l.signerPosition || "",
    });
  }

  function openDealTerms(l: Lead) {
    setEditingId(null);
    setEditingTermsId(l.id);
    setTermsForm({
      totalPrice: l.totalPrice != null ? String(l.totalPrice) : "",
      duration: l.duration != null ? String(l.duration) : "",
      days: l.days != null ? String(l.days) : "",
      startDate: l.startDate ? l.startDate.slice(0, 10) : "",
      endDate: l.endDate ? l.endDate.slice(0, 10) : "",
      needVideo: l.needVideo,
      videoAmount: l.videoAmount != null ? String(l.videoAmount) : "",
    });
  }

  async function saveDealTerms(id: number) {
    if (termsForm.startDate && termsForm.endDate && termsForm.endDate < termsForm.startDate) {
      setError("Дата окончания раньше даты начала");
      return;
    }
    setSavingTerms(true);
    setError("");
    try {
      const total = termsForm.totalPrice === "" ? null : Number(termsForm.totalPrice);
      const video = !termsForm.needVideo || termsForm.videoAmount === "" ? null : Number(termsForm.videoAmount);
      const placement = total != null ? Math.max(total - (video || 0), 0) : null;

      const payload = {
        id,
        totalPrice: total,
        duration: termsForm.duration === "" ? null : Number(termsForm.duration),
        days: termsForm.days === "" ? null : Number(termsForm.days),
        startDate: termsForm.startDate || null,
        endDate: termsForm.endDate || null,
        needVideo: termsForm.needVideo,
        videoAmount: video,
        placementAmount: placement,
      };

      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "fail");

      setLeads(prev =>
        prev.map(l =>
          l.id === id
            ? {
                ...l,
                totalPrice: payload.totalPrice,
                duration: payload.duration,
                days: payload.days,
                startDate: payload.startDate,
                endDate: payload.endDate,
                needVideo: payload.needVideo,
                videoAmount: payload.videoAmount,
                placementAmount: payload.placementAmount,
                status: data.status || l.status,
              }
            : l
        )
      );
      setEditingTermsId(null);
    } catch (e) {
      setError(e instanceof Error && e.message !== "fail" ? e.message : "Не удалось сохранить условия");
    } finally {
      setSavingTerms(false);
    }
  }

  async function saveRequisites(id: number) {
    setSavingReq(true);
    try {
      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify({ id, ...reqForm }),
      });
      if (!res.ok) throw new Error("fail");
      setLeads(prev => prev.map(l => (l.id === id ? withEvent({ ...l, ...reqForm }, "requisites", "Реквизиты обновлены") : l)));
      setEditingId(null);
    } catch {
      setError("Не удалось сохранить реквизиты");
    } finally {
      setSavingReq(false);
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUS_ORDER) c[s] = leads.filter(l => l.status === s).length;
    return c;
  }, [leads]);

  const activeSum = useMemo(
    () => leads.filter(l => ACTIVE_STATUSES.includes(l.status)).reduce((sum, l) => sum + (l.totalPrice || 0), 0),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const byStatus = statusFilter === "all" ? leads : leads.filter(l => l.status === statusFilter);

    const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");
    const q = norm(search.trim());
    const digits = q.replace(/\D/g, "");
    const base = !q
      ? byStatus
      : byStatus.filter(l => {
          const haystack = norm([l.name, l.company, l.email].filter(Boolean).join(" "));
          if (haystack.includes(q)) return true;
          if (digits.length >= 3 && l.phone.replace(/\D/g, "").includes(digits)) return true;
          return false;
        });

    const sorted = [...base];
    if (sortBy === "price") {
      sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return sorted;
  }, [leads, statusFilter, sortBy, search]);

  function withEvent(l: Lead, type: string, details: string): Lead {
    return { ...l, events: [{ type, details, createdAt: new Date().toISOString() }, ...(l.events || [])] };
  }

  function focusLead(id: number) {
    setSearch("");
    setStatusFilter("all");
    const idx = leads.findIndex(l => l.id === id);
    if (idx >= 0) setVisibleCount(c => Math.max(c, idx + PAGE_SIZE));
    setHighlightId(id);
    setTimeout(() => {
      document.getElementById(`lead-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    setTimeout(() => setHighlightId(null), 2600);
  }

  const visibleLeads = filteredLeads.slice(0, visibleCount);
  const restCount = filteredLeads.length - visibleLeads.length;

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  async function generateContract(id: number) {
    setGeneratingId(id);
    setContractError(prev => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(func2url.contract, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify({ leadId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fail");
      window.open(data.url, "_blank");
      const newDoc: LeadDocument = { id: data.docId ?? null, type: "contract", url: data.url, no: null, createdAt: new Date().toISOString() };
      setLeads(prev => prev.map(l => (l.id === id ? withEvent({ ...l, documents: [newDoc, ...l.documents] }, "document", docEventLabel(newDoc)) : l)));
    } catch (e) {
      setContractError(prev => ({ ...prev, [id]: e instanceof Error ? e.message : "Не удалось сформировать договор" }));
    } finally {
      setGeneratingId(null);
    }
  }

  async function deleteDocument(leadId: number, docId: number | null) {
    if (!docId) return;
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, documents: l.documents.filter(d => d.id !== docId) } : l)));
    try {
      const res = await fetch(`${func2url.leads}?docId=${docId}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey || "" },
      });
      if (!res.ok) throw new Error("fail");
    } catch {
      setError("Не удалось удалить документ");
    }
  }

  async function deleteLead(id: number) {
    const prev = leads;
    setLeads(cur => cur.filter(l => l.id !== id));
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`${func2url.leads}?leadId=${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey || "" },
      });
      if (!res.ok) throw new Error("fail");
    } catch {
      setLeads(prev);
      setError("Не удалось удалить заявку");
    }
  }

  async function changeStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("fail");
      setLeads(prev => prev.map(l => (l.id === id
        ? withEvent({ ...l, status }, "status", `${STATUS_LABELS[l.status] || l.status} → ${STATUS_LABELS[status] || status}`)
        : l)));
    } catch {
      setError("Не удалось изменить статус");
    } finally {
      setUpdating(null);
    }
  }

  async function savePayments(leadId: number, rows: LeadPayment[]) {
    const res = await fetch(func2url.leads, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
      body: JSON.stringify({ id: leadId, payments: rows }),
    });
    if (!res.ok) throw new Error("Не удалось сохранить график");
    const data = await res.json();
    const paidAmount = rows.filter(r => r.isPaid).reduce((s, r) => s + r.amount, 0);
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const updated = { ...l, payments: rows, paidAmount, status: data.status ?? l.status };
      return withEvent(
        updated,
        "schedule",
        `График платежей: ${rows.length} платеж(ей) на ${rows.reduce((s, r) => s + r.amount, 0).toLocaleString("ru-RU")} ₽`
      );
    }));
  }

  function openPaidEdit(l: Lead) {
    setEditingPaidId(l.id);
    setPaidInput(l.paidAmount ? String(l.paidAmount) : "");
  }

  async function savePaidAmount(id: number) {
    const paidAmount = Math.max(0, parseInt(paidInput || "0", 10) || 0);
    setSavingPaid(id);
    try {
      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey || "" },
        body: JSON.stringify({ id, paidAmount }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setLeads(prev => prev.map(l => {
        if (l.id !== id) return l;
        const diff = paidAmount - (l.paidAmount || 0);
        const sign = diff > 0 ? "+" : "−";
        const updated = { ...l, paidAmount, status: data.status ?? l.status };
        return diff === 0 ? updated
          : withEvent(updated, "payment", `${sign}${Math.abs(diff).toLocaleString("ru-RU")} ₽ · всего ${paidAmount.toLocaleString("ru-RU")} ₽`);
      }));
      setEditingPaidId(null);
    } catch {
      setError("Не удалось сохранить сумму оплаты");
    } finally {
      setSavingPaid(null);
    }
  }

  if (!adminKey) {
    return (
      <AdminLogin
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        authError={authError}
        checking={checking}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <AdminToolbar
          leadsCount={leads.length}
          loading={loading}
          activeSum={activeSum}
          counts={counts}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onLogout={handleLogout}
          search={search}
          setSearch={setSearch}
          foundCount={filteredLeads.length}
        />

        {!loading && <HelpPanel />}
        {!loading && <NewLeadForm onCreated={lead => setLeads(prev => [lead, ...prev])} />}
        {!loading && <UnpaidPanel leads={leads} onOpenLead={focusLead} />}
        {!loading && <StatsPanel leads={leads} />}
        {!loading && adminKey && <BackupPanel adminKey={adminKey} />}

        {loading && <div className="text-slate-500">Загружаем…</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{error}</div>}

        {!loading && leads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Icon name="Inbox" size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Заявок пока нет</p>
          </div>
        )}

        {!loading && leads.length > 0 && filteredLeads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Icon name={search ? "SearchX" : "Filter"} size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">
              {search ? `По запросу «${search}» ничего не найдено` : "Нет заявок с таким статусом"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-rose-600 hover:underline"
              >
                Сбросить поиск
              </button>
            )}
          </div>
        )}

        {!loading && filteredLeads.length > 0 && (
          <div className="grid gap-3">
            {visibleLeads.map(l => (
              <div key={l.id} id={`lead-${l.id}`} className={highlightId === l.id ? "rounded-2xl ring-2 ring-amber-400 ring-offset-2 transition" : "transition"}>
              <LeadCard
                lead={l}
                updating={updating}
                changeStatus={changeStatus}
                formatDate={formatDate}
                editingPaidId={editingPaidId}
                paidInput={paidInput}
                setPaidInput={setPaidInput}
                openPaidEdit={openPaidEdit}
                savePaidAmount={savePaidAmount}
                savingPaid={savingPaid}
                setEditingPaidId={setEditingPaidId}
                openRequisites={openRequisites}
                generateContract={generateContract}
                generatingId={generatingId}
                contractError={contractError}
                savePayments={savePayments}
                deleteDocument={deleteDocument}
                openDealTerms={openDealTerms}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                deleteLead={deleteLead}
              />
              </div>
            ))}
          </div>
        )}

        {!loading && restCount > 0 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Icon name="ChevronDown" size={16} />
              Показать ещё {Math.min(restCount, PAGE_SIZE)}
            </button>
            <div className="text-xs text-slate-400">
              Показано {visibleLeads.length} из {filteredLeads.length}
            </div>
          </div>
        )}
      </div>

      <AdminModal
        open={editingId !== null}
        title={editingLead?.inn ? "Реквизиты клиента" : "Добавить реквизиты"}
        subtitle={editingLead ? editingLead.company || editingLead.name : undefined}
        icon="FileText"
        onClose={() => setEditingId(null)}
      >
        <RequisitesForm
          form={reqForm}
          setForm={setReqForm}
          onSave={() => editingId !== null && saveRequisites(editingId)}
          onCancel={() => setEditingId(null)}
          saving={savingReq}
        />
      </AdminModal>

      <AdminModal
        open={editingTermsId !== null}
        title="Условия размещения"
        subtitle={termsLead ? termsLead.company || termsLead.name : undefined}
        icon="CalendarRange"
        onClose={() => setEditingTermsId(null)}
      >
        <DealTermsForm
          form={termsForm}
          setForm={setTermsForm}
          onSave={() => editingTermsId !== null && saveDealTerms(editingTermsId)}
          onCancel={() => setEditingTermsId(null)}
          saving={savingTerms}
        />
      </AdminModal>
    </div>
  );
};

export default Admin;