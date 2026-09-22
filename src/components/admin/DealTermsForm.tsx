import { DealTerms, LeadPayment } from "./adminTypes";
import { syncPeriod, periodConflict } from "./dealDates";
import PaymentRowsEditor from "./PaymentRowsEditor";

interface DealTermsFormProps {
  form: DealTerms;
  setForm: (f: DealTerms) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400";

export default function DealTermsForm({ form, setForm, onSave, onCancel, saving }: DealTermsFormProps) {
  const total = Number(form.totalPrice) || 0;
  const video = Number(form.videoAmount) || 0;
  const placement = Math.max(total - (form.needVideo ? video : 0), 0);
  const conflict = periodConflict(form);

  function setPeriod(field: "startDate" | "endDate" | "days", value: string) {
    setForm({ ...form, ...syncPeriod(form, field, value) });
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Стоимость, ₽</label>
          <input
            type="number"
            min={0}
            value={form.totalPrice}
            onChange={e => setForm({ ...form, totalPrice: e.target.value })}
            className={inputCls}
            placeholder="97500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Хронометраж, сек</label>
          <select
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}
            className={inputCls}
          >
            <option value="">Не выбран</option>
            <option value="5">5 секунд</option>
            <option value="10">10 секунд</option>
            <option value="15">15 секунд</option>
            <option value="20">20 секунд</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Дата начала</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => setPeriod("startDate", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Дата окончания</label>
          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={e => setPeriod("endDate", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">
            Дней размещения <span className="text-slate-400 font-normal">· считается по датам</span>
          </label>
          <input
            type="number"
            min={0}
            value={form.days}
            onChange={e => setPeriod("days", e.target.value)}
            className={inputCls}
            placeholder="30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Стоимость ролика, ₽</label>
          <input
            type="number"
            min={0}
            value={form.videoAmount}
            disabled={!form.needVideo}
            onChange={e => setForm({ ...form, videoAmount: e.target.value })}
            className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}
            placeholder="7500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.needVideo}
              onChange={e => setForm({ ...form, needVideo: e.target.checked })}
              className="w-4 h-4 accent-rose-600"
            />
            Нужно изготовление видеоролика
          </label>
        </div>

        {conflict && (
          <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            {conflict}
          </div>
        )}

        {total > 0 && (
          <div className="sm:col-span-2 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600">
            В документах: размещение {placement.toLocaleString("ru-RU")} ₽
            {form.needVideo && video > 0 && <> · ролик {video.toLocaleString("ru-RU")} ₽</>}
            {" "}· итого {total.toLocaleString("ru-RU")} ₽
          </div>
        )}

        <div className="sm:col-span-2">
          <PaymentRowsEditor
            rows={form.payments}
            setRows={(rows: LeadPayment[]) => setForm({ ...form, payments: rows })}
            total={total}
            startDate={form.startDate}
            endDate={form.endDate}
          />
        </div>

        <div className="sm:col-span-2 flex gap-2 mt-1">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
          >
            {saving ? "Сохраняем…" : "Сохранить условия"}
          </button>
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 px-2">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}