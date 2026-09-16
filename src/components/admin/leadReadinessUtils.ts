import { Lead } from "./adminTypes";

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
