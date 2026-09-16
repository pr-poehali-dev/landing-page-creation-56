export interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string | null;
  duration: number | null;
  days: number | null;
  needVideo: boolean;
  totalPrice: number | null;
  source: string;
  status: string;
  createdAt: string | null;
  company: string | null;
  startDate: string | null;
  endDate: string | null;
  placementAmount: number | null;
  videoAmount: number | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  legalAddress: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankBik: string | null;
  bankCorrAccount: string | null;
  signerName: string | null;
  signerPosition: string | null;
  paidAmount: number;
  documents: LeadDocument[];
}

export interface LeadDocument {
  id: number | null;
  type: "contract" | "invoice" | "act";
  url: string;
  no: string | null;
  createdAt: string | null;
}

export interface Requisites {
  company: string;
  inn: string;
  kpp: string;
  ogrn: string;
  legalAddress: string;
  bankName: string;
  bankAccount: string;
  bankBik: string;
  bankCorrAccount: string;
  signerName: string;
  signerPosition: string;
}

export const EMPTY_REQUISITES: Requisites = {
  company: "", inn: "", kpp: "", ogrn: "", legalAddress: "",
  bankName: "", bankAccount: "", bankBik: "", bankCorrAccount: "",
  signerName: "", signerPosition: "",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  estimate: "Смета",
  contract: "Договор",
  payment: "Оплата",
  live: "Эфир",
  completed: "Завершена",
  lost: "Потеряна",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  estimate: "bg-amber-100 text-amber-700",
  contract: "bg-blue-100 text-blue-700",
  payment: "bg-purple-100 text-purple-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

export const STATUS_ORDER = ["new", "estimate", "contract", "payment", "live", "completed", "lost"];
export const ACTIVE_STATUSES = ["new", "estimate", "contract", "payment", "live"];
