import Icon from "@/components/ui/icon";
import LeadCard from "./LeadCard";
import { LeadsData, PAGE_SIZE, formatDate } from "./useLeadsData";

interface LeadsBoardProps {
  data: LeadsData;
}

export default function LeadsBoard({ data }: LeadsBoardProps) {
  const {
    leads,
    loading,
    error,
    updating,
    generatingId,
    contractError,
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
    setVisibleCount,
    filteredLeads,
    visibleLeads,
    restCount,
    revealPhone,
    openRequisites,
    toggleExpanded,
    openDealTerms,
    generateContract,
    deleteDocument,
    deleteLead,
    changeStatus,
    savePayments,
    openPaidEdit,
    savePaidAmount,
  } = data;

  return (
    <>
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
          <Icon name="SearchX" size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">По запросу «{search}» ничего не найдено</p>
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
        <div className="flex justify-end mb-2">
          <button
            onClick={() =>
              setExpandedIds(expandedIds.length > 0 ? [] : filteredLeads.map(l => l.id))
            }
            className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
          >
            <Icon name={expandedIds.length > 0 ? "ChevronsDownUp" : "ChevronsUpDown"} size={13} />
            {expandedIds.length > 0 ? "Свернуть все" : "Развернуть все"}
          </button>
        </div>
      )}

      {!loading && filteredLeads.length > 0 && (
        <div className="grid gap-3">
          {visibleLeads.map(l => (
            <div key={l.id} id={`lead-${l.id}`}>
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
              revealPhone={revealPhone}
              deleteDocument={deleteDocument}
              openDealTerms={openDealTerms}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              deleteLead={deleteLead}
              expanded={expandedIds.includes(l.id)}
              toggleExpanded={toggleExpanded}
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
    </>
  );
}
