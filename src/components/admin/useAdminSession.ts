import { useState } from "react";
import func2url from "../../../backend/func2url.json";

interface UseAdminSessionArgs {
  setError: (v: string) => void;
  clearLeads: () => void;
}

export default function useAdminSession({ setError, clearLeads }: UseAdminSessionArgs) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fb-session-token"));
  const [staffName, setStaffName] = useState(() => localStorage.getItem("fb-staff-name") || "");
  const [staffRole, setStaffRole] = useState(() => localStorage.getItem("fb-staff-role") || "manager");
  const [mustChange, setMustChange] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [passModal, setPassModal] = useState(false);

  function handleStaffLogin(session: { token: string; name: string; role: string; mustChange: boolean }) {
    localStorage.setItem("fb-session-token", session.token);
    localStorage.setItem("fb-staff-name", session.name);
    localStorage.setItem("fb-staff-role", session.role);
    setToken(session.token);
    setStaffName(session.name);
    setStaffRole(session.role);
    setMustChange(session.mustChange);

    if ((session as { backupDue?: boolean }).backupDue) {
      fetch(func2url.security, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": session.token },
        body: JSON.stringify({ action: "autoBackup" }),
      }).catch(() => undefined);
    }
  }

  async function handleLogout() {
    if (token) {
      await fetch(func2url.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => undefined);
    }
    localStorage.removeItem("fb-session-token");
    localStorage.removeItem("fb-staff-name");
    localStorage.removeItem("fb-staff-role");
    setToken(null);
    setStaffName("");
    clearLeads();
  }

  async function submitNewPassword() {
    if (newPass.length < 6) {
      setError("Пароль должен быть от 6 символов");
      return;
    }
    const res = await fetch(func2url.auth, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": token || "" },
      body: JSON.stringify({ action: "changePassword", newPassword: newPass }),
    });
    if (res.ok) {
      setMustChange(false);
      setNewPass("");
    } else {
      setError("Не удалось сменить пароль");
    }
  }

  return {
    token,
    setToken,
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
  };
}

export type AdminSession = ReturnType<typeof useAdminSession>;
