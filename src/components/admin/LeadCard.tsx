import Icon from "@/components/ui/icon";
import { Lead, LeadPayment, STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "./adminTypes";
import LeadReadiness from "./LeadReadiness";
import SendDocButton from "./SendDocButton";
import LeadHistory from "./LeadHistory";
import ConsentBadge from "./ConsentBadge";
import PaymentSchedule from "./PaymentSchedule";

interface LeadCardProps {
  lead: Lead;
  updating: number | null;
  changeStatus: (id: number, status: string) => void;
  formatDate: (iso: string | null) => string;
  editingPaidId: number | null;
  paidInput: string;
  setPaidInput: (v: string) => void;
  openPaidEdit: (l: Lead) => void;
  savePaidAmount: (id: number) => void;
  savingPaid: number | null;
  setEditingPaidId: (id: number | null) => void;
  openRequisites: (l: Lead) => void;
  generateContract: (id: number) => void;
  generatingId: number | null;
  contractError: Record<number, string>;
  savePayments: (leadId: number, rows: LeadPayment[]) => Promise<void>;
  revealPhone: (leadId: number) => Promise<void>;
  deleteDocument: (leadId: number, docId: number | null) => void;
  openDealTerms: (l: Lead) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  deleteLead: (id: number) => void;
  expanded: boolean;
  toggleExpanded: (id: number) => void;
}

export default function LeadCard({
  lead: l,
  updating,
  changeStatus,
  formatDate,
  editingPaidId,
  paidInput,
  setPaidInput,
  openPaidEdit,
  savePaidAmount,
  savingPaid,
  setEditingPaidId,
  openRequisites,
  generateContract,
  generatingId,
  contractError,
  savePayments,
  revealPhone,
  deleteDocument,
  openDealTerms,
  confirmDeleteId,
  setConfirmDeleteId,
  deleteLead,
  expanded,
  toggleExpanded,
}: LeadCardProps) {
  const nextDue = (l.payments || []).filter(p => !p.isPaid).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const overdue = nextDue ? new Date(nextDue.dueDate) < new Date(new Date().toDateString()) : false;

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm transition ${overdue && !expanded ? "border-rose-200" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <button
            onClick={() => toggleExpanded(l.id)}
            title={expanded ? "Свернуть карточку" : "Развернуть карточку"}
            className="mt-1 text-slate-400 hover:text-slate-700 transition shrink-0"
          >
            <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={18} />
          </button>
        <div className="min-w-0">
          <div
            onClick={() => toggleExpanded(l.id)}
            className="font-semibold text-slate-900 text-lg cursor-pointer hover:text-rose-600 transition"
          >
            {l.name}
          </div>
          {l.company && <div className="text-slate-500 text-sm">{l.company}</div>}
          {l.source === "manual" && (
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 mt-1">
              <Icon name="PhoneCall" size={10} />
              Добавлена вручную
            </div>
          )}
          {l.phoneHidden ? (
            <button
              onClick={() => revealPhone(l.id)}
              title="Показать телефон — действие попадёт в журнал"
              className="text-slate-500 font-medium flex items-center gap-1.5 hover:text-rose-600 transition"
            >
              {l.phone}
              <Icon name="Eye" size={13} />
            </button>
          ) : (
            <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-rose-600 font-medium block">{l.phone}</a>
          )}
        </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">{formatDate(l.createdAt)}</div>
            <button
              onClick={() => setConfirmDeleteId(l.id)}
              title="Удалить заявку"
              className="text-slate-300 hover:text-rose-600 transition"
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
          <select
            value={l.status}
            disabled={updating === l.id}
            onChange={e => changeStatus(l.id, e.target.value)}
            className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer outline-none ${STATUS_COLORS[l.status] || "bg-slate-100 text-slate-700"}`}
          >
            {STATUS_ORDER.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>
      {confirmDeleteId === l.id && (
        <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="text-sm font-medium text-rose-900">Удалить заявку «{l.company || l.name}»?</div>
          <div className="text-xs text-rose-700 mt-1">
            Заявка и {l.documents.length > 0 ? `${l.documents.length} связанных документов исчезнут` : "её данные исчезнут"} из системы. Отменить это будет нельзя.
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => deleteLead(l.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg px-3 py-2 transition"
            >
              Да, удалить
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg px-3 py-2 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      {!expanded && (
        <div
          onClick={() => toggleExpanded(l.id)}
          className="mt-3 flex flex-wrap items-center gap-2 text-xs cursor-pointer"
        >
          {l.totalPrice ? (
            <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 font-semibold">
              {l.totalPrice.toLocaleString("ru-RU")} ₽
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 rounded-full px-3 py-1">условия не заданы</span>
          )}
          {!!l.totalPrice && (
            <span className={`rounded-full px-3 py-1 font-medium ${
              l.paidAmount >= (l.totalPrice || 0)
                ? "bg-emerald-100 text-emerald-700"
                : l.paidAmount > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-600"
            }`}>
              {l.paidAmount >= (l.totalPrice || 0) ? "оплачено" : l.paidAmount > 0 ? `оплачено ${l.paidAmount.toLocaleString("ru-RU")} ₽` : "не оплачено"}
            </span>
          )}
          {nextDue && (
            <span className={`rounded-full px-3 py-1 font-medium ${overdue ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
              {overdue ? "просрочен платёж" : "след. платёж"} {nextDue.amount.toLocaleString("ru-RU")} ₽ до{" "}
              {new Date(nextDue.dueDate).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
            </span>
          )}
          {l.documents.length > 0 && (
            <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 flex items-center gap-1">
              <Icon name="Paperclip" size={11} />
              {l.documents.length}
            </span>
          )}
          <span className="text-slate-400 hover:text-rose-600 transition ml-auto">подробнее →</span>
        </div>
      )}

      {expanded && (
      <>
      {l.comment && <p className="mt-3 text-slate-600 text-sm leading-relaxed">{l.comment}</p>}
      {(l.duration || l.days || l.totalPrice || l.startDate) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {l.duration && <span className="bg-slate-100 rounded-full px-3 py-1">{l.duration}″</span>}
          {l.days && <span className="bg-slate-100 rounded-full px-3 py-1">{l.days} дней</span>}
          {l.startDate && <span className="bg-slate-100 rounded-full px-3 py-1">с {formatDate(l.startDate).split(",")[0]}</span>}
          {l.endDate && <span className="bg-slate-100 rounded-full px-3 py-1">по {formatDate(l.endDate).split(",")[0]}</span>}
          {l.needVideo && <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1">нужно видео</span>}
          {l.totalPrice && <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 font-semibold">{l.totalPrice.toLocaleString("ru-RU")} ₽</span>}
        </div>
      )}
      {l.totalPrice && (
        <div className="mt-3 bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Icon name="Wallet" size={14} className="text-slate-400" />
              Оплачено {l.paidAmount.toLocaleString("ru-RU")} ₽ из {l.totalPrice.toLocaleString("ru-RU")} ₽
              {l.paidAmount >= l.totalPrice ? (
                <span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium">Оплачено</span>
              ) : l.paidAmount > 0 ? (
                <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">Частично</span>
              ) : (
                <span className="bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 font-medium">Не оплачено</span>
              )}
            </div>
            {editingPaidId !== l.id && (
              <button
                onClick={() => openPaidEdit(l)}
                className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
              >
                <Icon name="Pencil" size={12} />
                Указать оплату
              </button>
            )}
          </div>
          <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${l.paidAmount >= l.totalPrice ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, (l.paidAmount / l.totalPrice) * 100)}%` }}
            />
          </div>
          {editingPaidId === l.id && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={paidInput}
                onChange={e => setPaidInput(e.target.value)}
                placeholder="Сумма оплаты, ₽"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-40 outline-none focus:border-rose-400"
              />
              <button
                onClick={() => savePaidAmount(l.id)}
                disabled={savingPaid === l.id}
                className="text-sm bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition disabled:opacity-50"
              >
                {savingPaid === l.id ? "Сохраняем…" : "Сохранить"}
              </button>
              <button
                onClick={() => setEditingPaidId(null)}
                className="text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}

      {(l.inn || l.legalAddress || l.bankAccount) && (
        <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-0.5">
          {l.inn && <div>ИНН {l.inn}{l.kpp ? ` · КПП ${l.kpp}` : ""}{l.ogrn ? ` · ОГРН ${l.ogrn}` : ""}</div>}
          {l.legalAddress && <div>{l.legalAddress}</div>}
          {l.bankAccount && <div>Р/с {l.bankAccount}{l.bankBik ? ` · БИК ${l.bankBik}` : ""}</div>}
        </div>
      )}

      <PaymentSchedule lead={l} savePayments={savePayments} openDealTerms={openDealTerms} />

      <ConsentBadge lead={l} formatDate={formatDate} />

      <LeadReadiness lead={l} openRequisites={openRequisites} openDealTerms={openDealTerms} />

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition">Позвонить</a>
        <a href="https://t.me/izumrudvlpm" target="_blank" rel="noopener noreferrer" className="text-sm bg-sky-500 text-white rounded-lg px-4 py-2 hover:bg-sky-600 transition">Telegram</a>
        <button
          onClick={() => openRequisites(l)}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5"
        >
          <Icon name="FileText" size={15} />
          {l.inn ? "Реквизиты" : "Добавить реквизиты"}
        </button>
        <button
          onClick={() => openDealTerms(l)}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5"
        >
          <Icon name="CalendarRange" size={15} />
          {l.totalPrice ? "Условия" : "Указать условия"}
        </button>
        <button
          onClick={() => generateContract(l.id)}
          disabled={generatingId === l.id || (!l.inn && !l.legalAddress)}
          title={!l.inn && !l.legalAddress ? "Заполните реквизиты клиента — ИНН или юридический адрес" : ""}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="FileSignature" size={15} />
          {generatingId === l.id ? "Формируем…" : "Сформировать договор"}
        </button>
      </div>
      {contractError[l.id] && <div className="text-red-600 text-xs mt-2">{contractError[l.id]}</div>}

      {l.documents.length > 0 && (
        <div className="mt-3 bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-medium text-slate-500 mb-2">Документы</div>
          <div className="space-y-1.5">
            {l.documents.map((doc, i) => (
              <div key={doc.id ?? i} className="flex items-center gap-2 group">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-700 hover:text-rose-600 transition flex-1 min-w-0"
                >
                  <Icon name={doc.type === "contract" ? "FileSignature" : doc.type === "invoice" ? "Receipt" : "ClipboardCheck"} size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{doc.type === "contract" ? "Договор" : doc.type === "invoice" ? "Счёт" : "Акт"}</span>
                  {doc.createdAt && <span className="text-xs text-slate-400 shrink-0">{formatDate(doc.createdAt)}</span>}
                </a>
                <SendDocButton docId={doc.id} clientEmail={l.email} />
                <button
                  onClick={() => deleteDocument(l.id, doc.id)}
                  disabled={!doc.id}
                  title="Удалить документ"
                  className="text-slate-300 hover:text-red-600 transition shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <LeadHistory events={l.events} />
      </>
      )}
    </div>
  );
}