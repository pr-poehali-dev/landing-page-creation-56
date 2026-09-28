import AdminModal from "./AdminModal";
import RequisitesForm from "./RequisitesForm";
import DealTermsForm from "./DealTermsForm";
import { LeadsData } from "./useLeadsData";

interface AdminDialogsProps {
  data: LeadsData;
}

export default function AdminDialogs({ data }: AdminDialogsProps) {
  const {
    editingId,
    setEditingId,
    editingLead,
    reqForm,
    setReqForm,
    saveRequisites,
    savingReq,
    editingTermsId,
    setEditingTermsId,
    termsLead,
    termsForm,
    setTermsForm,
    saveDealTerms,
    savingTerms,
  } = data;

  return (
    <>
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
          leadStatus={termsLead?.status}
        />
      </AdminModal>
    </>
  );
}
