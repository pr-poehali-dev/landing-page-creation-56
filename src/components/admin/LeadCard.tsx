import Icon from "@/components/ui/icon";
import { Lead, Requisites, STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "./adminTypes";

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
  editingId: number | null;
  openRequisites: (l: Lead) => void;
  setEditingId: (id: number | null) => void;
  generateContract: (id: number) => void;
  generatingId: number | null;
  generateInvoice: (id: number) => void;
  invoiceGeneratingId: number | null;
  generateAct: (id: number) => void;
  actGeneratingId: number | null;
  contractError: Record<number, string>;
  invoiceError: Record<number, string>;
  actError: Record<number, string>;
  deleteDocument: (leadId: number, docId: number | null) => void;
  reqForm: Requisites;
  setReqForm: (r: Requisites) => void;
  saveRequisites: (id: number) => void;
  savingReq: boolean;
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
  editingId,
  openRequisites,
  setEditingId,
  generateContract,
  generatingId,
  generateInvoice,
  invoiceGeneratingId,
  generateAct,
  actGeneratingId,
  contractError,
  invoiceError,
  actError,
  deleteDocument,
  reqForm,
  setReqForm,
  saveRequisites,
  savingReq,
}: LeadCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900 text-lg">{l.name}</div>
          {l.company && <div className="text-slate-500 text-sm">{l.company}</div>}
          <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-rose-600 font-medium">{l.phone}</a>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-xs text-slate-400">{formatDate(l.createdAt)}</div>
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

      {(l.inn || l.legalAddress || l.bankAccount) && editingId !== l.id && (
        <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-0.5">
          {l.inn && <div>ИНН {l.inn}{l.kpp ? ` · КПП ${l.kpp}` : ""}{l.ogrn ? ` · ОГРН ${l.ogrn}` : ""}</div>}
          {l.legalAddress && <div>{l.legalAddress}</div>}
          {l.bankAccount && <div>Р/с {l.bankAccount}{l.bankBik ? ` · БИК ${l.bankBik}` : ""}</div>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="text-sm bg-slate-900 text-white rounded-lg px-4 py-2 hover:bg-slate-700 transition">Позвонить</a>
        <a href="https://t.me/izumrudvlpm" target="_blank" rel="noopener noreferrer" className="text-sm bg-sky-500 text-white rounded-lg px-4 py-2 hover:bg-sky-600 transition">Telegram</a>
        <button
          onClick={() => (editingId === l.id ? setEditingId(null) : openRequisites(l))}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5"
        >
          <Icon name="FileText" size={15} />
          {editingId === l.id ? "Свернуть" : l.inn ? "Реквизиты" : "Добавить реквизиты"}
        </button>
        <button
          onClick={() => generateContract(l.id)}
          disabled={generatingId === l.id || (!l.inn && !l.legalAddress)}
          title={!l.inn && !l.legalAddress ? "Сначала заполните реквизиты клиента" : ""}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="FileSignature" size={15} />
          {generatingId === l.id ? "Формируем…" : "Сформировать договор"}
        </button>
        <button
          onClick={() => generateInvoice(l.id)}
          disabled={invoiceGeneratingId === l.id || !l.totalPrice}
          title={!l.totalPrice ? "У заявки не указана стоимость услуг" : ""}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="Receipt" size={15} />
          {invoiceGeneratingId === l.id ? "Формируем…" : "Выставить счёт"}
        </button>
        <button
          onClick={() => generateAct(l.id)}
          disabled={actGeneratingId === l.id || !l.totalPrice}
          title={!l.totalPrice ? "У заявки не указана стоимость услуг" : ""}
          className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="ClipboardCheck" size={15} />
          {actGeneratingId === l.id ? "Формируем…" : "Сформировать акт"}
        </button>
      </div>
      {contractError[l.id] && <div className="text-red-600 text-xs mt-2">{contractError[l.id]}</div>}
      {invoiceError[l.id] && <div className="text-red-600 text-xs mt-2">{invoiceError[l.id]}</div>}
      {actError[l.id] && <div className="text-red-600 text-xs mt-2">{actError[l.id]}</div>}

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

      {editingId === l.id && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">Организация / ИП</label>
            <input value={reqForm.company} onChange={e => setReqForm({ ...reqForm, company: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" placeholder="ООО «Компания»" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">ИНН</label>
            <input value={reqForm.inn} onChange={e => setReqForm({ ...reqForm, inn: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">КПП</label>
            <input value={reqForm.kpp} onChange={e => setReqForm({ ...reqForm, kpp: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">ОГРН / ОГРНИП</label>
            <input value={reqForm.ogrn} onChange={e => setReqForm({ ...reqForm, ogrn: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">Юридический адрес</label>
            <input value={reqForm.legalAddress} onChange={e => setReqForm({ ...reqForm, legalAddress: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">Банк</label>
            <input value={reqForm.bankName} onChange={e => setReqForm({ ...reqForm, bankName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Р/с</label>
            <input value={reqForm.bankAccount} onChange={e => setReqForm({ ...reqForm, bankAccount: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">БИК</label>
            <input value={reqForm.bankBik} onChange={e => setReqForm({ ...reqForm, bankBik: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 block mb-1">Корр. счёт</label>
            <input value={reqForm.bankCorrAccount} onChange={e => setReqForm({ ...reqForm, bankCorrAccount: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">ФИО подписанта</label>
            <input value={reqForm.signerName} onChange={e => setReqForm({ ...reqForm, signerName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" placeholder="Иванов Иван Иванович" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Должность</label>
            <input value={reqForm.signerPosition} onChange={e => setReqForm({ ...reqForm, signerPosition: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400" placeholder="Директор" />
          </div>
          <div className="sm:col-span-2 flex gap-2 mt-1">
            <button
              onClick={() => saveRequisites(l.id)}
              disabled={savingReq}
              className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              {savingReq ? "Сохраняем…" : "Сохранить реквизиты"}
            </button>
            <button onClick={() => setEditingId(null)} className="text-sm text-slate-500 hover:text-slate-700 px-2">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}
