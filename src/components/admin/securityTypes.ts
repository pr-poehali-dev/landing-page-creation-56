export interface AuditEntry {
  id: number;
  staffName: string | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  details: string | null;
  ip: string | null;
  severity: string;
  createdAt: string | null;
}

export interface StaffMember {
  id: number;
  name: string;
  login: string;
  role: string;
  roleLabel: string;
  active: boolean;
  lastLoginAt: string | null;
}

export interface TrashItem {
  id: number;
  entity: string;
  entityId: number;
  title: string | null;
  removedBy: string | null;
  restoreUntil: string | null;
  createdAt: string | null;
  daysLeft: number;
}

export interface BackupRun {
  id: number;
  url: string | null;
  kind: string;
  status: string;
  note: string | null;
  createdAt: string | null;
}

export interface StaffSession {
  token: string;
  name: string;
  role: string;
  mustChange: boolean;
}

export const ACTION_LABELS: Record<string, string> = {
  login: "Вход в систему",
  logout: "Выход",
  login_failed: "Неудачный вход",
  lead_deleted: "Удалена заявка",
  leads_cleaned: "Очистка тестовых заявок",
  status_changed: "Смена статуса",
  payment_changed: "Изменена оплата",
  terms_changed: "Изменены условия",
  phone_revealed: "Открыт телефон клиента",
  export: "Выгрузка данных",
  restored: "Восстановление из корзины",
  backup_created: "Резервная копия",
  backup_auto: "Автокопия",
  password_changed: "Смена пароля",
  password_reset: "Сброс пароля",
  staff_created: "Созданы аккаунты",
  staff_toggled: "Доступ сотрудника",
  role_changed: "Смена роли",
};

export const ACTION_ICONS: Record<string, string> = {
  login: "LogIn",
  logout: "LogOut",
  login_failed: "ShieldAlert",
  lead_deleted: "Trash2",
  leads_cleaned: "Eraser",
  status_changed: "ArrowRightLeft",
  payment_changed: "Wallet",
  terms_changed: "CalendarRange",
  phone_revealed: "Eye",
  export: "Download",
  restored: "Undo2",
  backup_created: "DatabaseBackup",
  backup_auto: "DatabaseBackup",
  password_changed: "KeyRound",
  password_reset: "KeyRound",
  staff_created: "UserPlus",
  staff_toggled: "UserCog",
  role_changed: "UserCog",
};

export function fmtWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `сегодня ${time}`;
  return `${d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })} ${time}`;
}
