import StaffLogin from "@/components/admin/StaffLogin";
import PasswordInput from "@/components/admin/PasswordInput";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import SecurityPanel from "@/components/admin/SecurityPanel";
import AdminToolbar from "@/components/admin/AdminToolbar";
import NewLeadForm from "@/components/admin/NewLeadForm";
import MediaPlanPanel from "@/components/admin/MediaPlanPanel";
import LeadsBoard from "@/components/admin/LeadsBoard";
import AdminDialogs from "@/components/admin/AdminDialogs";
import useAdminSession from "@/components/admin/useAdminSession";
import useLeadsData from "@/components/admin/useLeadsData";

const Admin = () => {
  const session = useAdminSession({
    setError: v => data.setError(v),
    clearLeads: () => data.setLeads([]),
  });

  const data = useLeadsData({ token: session.token, setToken: session.setToken });

  const {
    token,
    staffName,
    staffRole,
    mustChange,
    newPass,
    setNewPass,
    passModal,
    setPassModal,
    handleStaffLogin,
    handleLogout,
    submitNewPassword,
  } = session;

  const { leads, setLeads, loading, search, setSearch, filteredLeads, fetchLeads } = data;

  if (!token) {
    return <StaffLogin onLogin={handleStaffLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {passModal && token && (
        <ChangePasswordModal token={token} onClose={() => setPassModal(false)} />
      )}
      <div className="max-w-6xl mx-auto">
        {mustChange && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="text-sm font-medium text-amber-900 mb-1">
              Смените временный пароль
            </div>
            <div className="text-xs text-amber-700 mb-2">
              Вы вошли с паролем, который выдала система. Придумайте свой — он будет известен только вам.
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PasswordInput
                value={newPass}
                onChange={setNewPass}
                placeholder="Новый пароль (от 6 символов)"
                className="text-sm border border-amber-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400 bg-white"
                eyeClassName="text-amber-500 hover:text-amber-700"
              />
              <button
                onClick={submitNewPassword}
                className="text-sm bg-amber-600 text-white rounded-lg px-4 py-2 hover:bg-amber-700 transition"
              >
                Сохранить пароль
              </button>
            </div>
          </div>
        )}
        <AdminToolbar
          onChangePassword={() => setPassModal(true)}
          leadsCount={leads.length}
          loading={loading}
          onLogout={handleLogout}
          staffName={staffName}
          staffRole={staffRole}
          search={search}
          setSearch={setSearch}
          foundCount={filteredLeads.length}
        />

        {!loading && <NewLeadForm onCreated={lead => setLeads(prev => [lead, ...prev])} />}
        {!loading && <MediaPlanPanel token={token || ""} />}

        <LeadsBoard data={data} />

        {!loading && token && staffRole === "director" && (
          <div className="mt-6">
            <SecurityPanel token={token} onRestored={fetchLeads} />
          </div>
        )}
      </div>

      <AdminDialogs data={data} />
    </div>
  );
};

export default Admin;
