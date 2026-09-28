import { useState, useEffect, useMemo } from "react";
import func2url from "../../../backend/func2url.json";
import {
  Lead,
  LeadDocument,
  LeadPayment,
  Requisites,
  EMPTY_REQUISITES,
  DealTerms,
  EMPTY_DEAL_TERMS,
  STATUS_LABELS,
} from "./adminTypes";

export const PAGE_SIZE = 20;

const DOC_NAMES: Record<string, string> = { contract: "Договор", invoice: "Счёт", act: "Акт" };

function docEventLabel(doc: LeadDocument): string {
  return `${DOC_NAMES[doc.type] || "Документ"}${doc.no ? ` № ${doc.no}` : ""}`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface UseLeadsDataArgs {
  token: string | null;
  setToken: (v: string | null) => void;
}

export default function useLeadsData({ token, setToken }: UseLeadsDataArgs) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
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
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const editingLead = leads.find(l => l.id === editingId) || null;
  const termsLead = leads.find(l => l.id === editingTermsId) || null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(func2url.leads, { headers: { "X-Session-Token": token || "" } })
      .then(r => {
        if (r.status === 403) throw new Error("forbidden");
        return r.json();
      })
      .then(d => setLeads(d.leads || []))
      .catch(err => {
        if (err.message === "forbidden") {
          localStorage.removeItem("fb-session-token");
          setToken(null);
        } else {
          setError("Не удалось загрузить заявки");
        }
      })
      .finally(() => setLoading(false));
  }, [token, setToken]);

  async function revealPhone(leadId: number) {
    if (!token) return;
    try {
      const res = await fetch(`${func2url.leads}?revealPhone=${leadId}`, {
        headers: { "X-Session-Token": token },
      });
      if (!res.ok) return;
      const d = await res.json();
      const fresh = (d.leads || []).find((x: Lead) => x.id === leadId);
      if (fresh) {
        setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, phone: fresh.phone, phoneHidden: false } : l)));
      }
    } catch {
      setError("Не удалось открыть телефон");
    }
  }

  async function fetchLeads() {
    if (!token) return;
    try {
      const res = await fetch(func2url.leads, { headers: { "X-Session-Token": token || "" } });
      if (!res.ok) return;
      const d = await res.json();
      setLeads(d.leads || []);
    } catch {
      setError("Не удалось обновить список заявок");
    }
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

  function toggleExpanded(id: number) {
    setExpandedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
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
      payments: (l.payments || []).map(p => ({ ...p })),
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
        payments: termsForm.payments.filter(p => p.dueDate && p.amount > 0),
      };

      const res = await fetch(func2url.leads, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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
                payments: payload.payments,
                paidAmount: payload.payments.filter(p => p.isPaid).reduce((s, p) => s + p.amount, 0),
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
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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

  const filteredLeads = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");
    const q = norm(search.trim());
    const digits = q.replace(/\D/g, "");
    const base = !q
      ? leads
      : leads.filter(l => {
          const haystack = norm([l.name, l.company, l.email].filter(Boolean).join(" "));
          if (haystack.includes(q)) return true;
          if (digits.length >= 3 && l.phone.replace(/\D/g, "").includes(digits)) return true;
          return false;
        });

    return [...base].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [leads, search]);

  function withEvent(l: Lead, type: string, details: string): Lead {
    return { ...l, events: [{ type, details, createdAt: new Date().toISOString() }, ...(l.events || [])] };
  }

  const visibleLeads = filteredLeads.slice(0, visibleCount);
  const restCount = filteredLeads.length - visibleLeads.length;

  async function generateContract(id: number) {
    setGeneratingId(id);
    setContractError(prev => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(func2url.contract, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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
        headers: { "X-Session-Token": token || "" },
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
        headers: { "X-Session-Token": token || "" },
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
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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
      headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
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

  return {
    leads,
    setLeads,
    loading,
    error,
    setError,
    updating,
    editingId,
    setEditingId,
    reqForm,
    setReqForm,
    savingReq,
    generatingId,
    contractError,
    editingTermsId,
    setEditingTermsId,
    termsForm,
    setTermsForm,
    savingTerms,
    editingPaidId,
    setEditingPaidId,
    paidInput,
    setPaidInput,
    savingPaid,
    confirmDeleteId,
    setConfirmDeleteId,
    expandedIds,
    setExpandedIds,
    search,
    setSearch,
    visibleCount,
    setVisibleCount,
    editingLead,
    termsLead,
    filteredLeads,
    visibleLeads,
    restCount,
    revealPhone,
    fetchLeads,
    openRequisites,
    toggleExpanded,
    openDealTerms,
    saveDealTerms,
    saveRequisites,
    generateContract,
    deleteDocument,
    deleteLead,
    changeStatus,
    savePayments,
    openPaidEdit,
    savePaidAmount,
  };
}

export type LeadsData = ReturnType<typeof useLeadsData>;
