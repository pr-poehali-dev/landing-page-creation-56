import { Lead } from "./adminTypes";
import {
  validateInn,
  validateEmail,
  validateKpp,
  validateOgrn,
  validateAccount,
  validateBik,
  validatePhone,
} from "./validation";

export interface SuspiciousField {
  label: string;
  problem: string;
  inRequisites: boolean;
}

export function getSuspiciousFields(l: Lead): SuspiciousField[] {
  const found: SuspiciousField[] = [];

  const checks: { label: string; value: string | null; check: (v: string) => string | null; inRequisites: boolean }[] = [
    { label: "Телефон", value: l.phone, check: validatePhone, inRequisites: false },
    { label: "ИНН", value: l.inn, check: validateInn, inRequisites: true },
    { label: "КПП", value: l.kpp, check: validateKpp, inRequisites: true },
    { label: "ОГРН", value: l.ogrn, check: validateOgrn, inRequisites: true },
    { label: "Расчётный счёт", value: l.bankAccount, check: validateAccount, inRequisites: true },
    { label: "БИК", value: l.bankBik, check: validateBik, inRequisites: true },
    { label: "Корр. счёт", value: l.bankCorrAccount, check: validateAccount, inRequisites: true },
    { label: "Email", value: l.email, check: validateEmail, inRequisites: true },
  ];

  for (const c of checks) {
    if (!c.value) continue;
    const problem = c.check(c.value);
    if (problem) {
      const short = problem.replace(/ — .*$/, "").replace(/^[А-ЯЁ]/, m => m.toLowerCase());
      found.push({ label: c.label, problem: short, inRequisites: c.inRequisites });
    }
  }

  if (l.startDate && l.endDate && new Date(l.endDate) < new Date(l.startDate)) {
    found.push({
      label: "Сроки размещения",
      problem: "дата окончания раньше даты начала",
      inRequisites: false,
    });
  }

  if (l.totalPrice && l.paidAmount > l.totalPrice) {
    found.push({
      label: "Оплата",
      problem: "оплачено больше суммы сделки",
      inRequisites: false,
    });
  }

  return found;
}

export interface MissingField {
  label: string;
  docs: string[];
  inRequisites: boolean;
}

export function getMissingFields(l: Lead): MissingField[] {
  const missing: MissingField[] = [];

  if (!l.inn && !l.legalAddress) {
    missing.push({ label: "реквизиты клиента: ИНН или юридический адрес", docs: ["договор"], inRequisites: true });
  }
  if (!l.company) {
    missing.push({ label: "название организации", docs: ["договор", "счёт", "акт"], inRequisites: true });
  }
  if (l.inn && !l.bankAccount) {
    missing.push({ label: "банковские реквизиты", docs: ["договор"], inRequisites: true });
  }
  if (l.inn && !l.signerName) {
    missing.push({ label: "подписант со стороны клиента", docs: ["договор"], inRequisites: true });
  }
  if (!l.totalPrice) {
    missing.push({ label: "стоимость размещения", docs: ["договор", "счёт", "акт"], inRequisites: false });
  }
  if (!l.startDate || !l.endDate) {
    missing.push({ label: "сроки размещения", docs: ["договор"], inRequisites: false });
  }
  if (!l.duration) {
    missing.push({ label: "хронометраж ролика", docs: ["договор"], inRequisites: false });
  }

  return missing;
}