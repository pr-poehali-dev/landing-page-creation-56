import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Lead } from "./adminTypes";

interface TestDataPanelProps {
  leads: Lead[];
  onCleaned: (ids: number[]) => Promise<void>;
}

const TEST_NAMES = ["тестовый клиент", "тест", "тест согласие", "test", "р"];

export function findTestLeads(leads: Lead[]): Lead[] {
  return leads.filter(l => {
    if (l.source === "test") return true;
    const name = (l.name || "").trim().toLowerCase();
    if (l.company) return false;
    if (TEST_NAMES.includes(name)) return true;
    return name.startsWith("тест");
  });
}

export default function TestDataPanel({ leads, onCleaned }: TestDataPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const testLeads = findTestLeads(leads);
  if (testLeads.length === 0) return null;

  async function handleClean() {
    setWorking(true);
    setError("");
    try {
      await onCleaned(testLeads.map(l => l.id));
      setConfirming(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить заявки");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 p-5">
      <div className="flex items-start gap-3 flex-wrap justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Icon name="Eraser" size={19} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-base">Тестовые заявки</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Найдено {testLeads.length} служебных записей от проверок системы. Реальные клиенты не затрагиваются.
            </div>
          </div>
        </div>
        {!confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-sm bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <Icon name="Trash2" size={15} />
            Очистить
          </button>
        )}
      </div>

      {confirming && (
        <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="text-sm font-medium text-rose-900">
            Удалить {testLeads.length} тестовых заявок?
          </div>
          <div className="text-xs text-rose-700 mt-1">
            Будут удалены: {testLeads.slice(0, 6).map(l => l.name).join(", ")}
            {testLeads.length > 6 && ` и ещё ${testLeads.length - 6}`}. Отменить будет нельзя.
          </div>
          {error && <div className="text-xs text-rose-700 mt-2 font-medium">{error}</div>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleClean}
              disabled={working}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg px-3 py-2 transition disabled:opacity-50"
            >
              {working ? "Удаляем…" : "Да, удалить"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg px-3 py-2 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
