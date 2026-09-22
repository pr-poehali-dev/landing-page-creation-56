import { useState } from "react";
import Icon from "@/components/ui/icon";

const STEPS = [
  {
    icon: "Inbox",
    color: "bg-slate-100 text-slate-600",
    title: "1. Заявка появляется в системе",
    text: "С сайта заявки приходят сами со статусом «Новая». Если клиент позвонил — «Добавить заявку вручную» вверху: достаточно имени и телефона, остальное заполните позже. Нажатие на номер сразу набирает клиента.",
  },
  {
    icon: "CalendarRange",
    color: "bg-amber-50 text-amber-600",
    title: "2. Заполните условия и график платежей",
    text: "Кнопка «Условия»: стоимость, даты размещения, хронометраж. Там же график платежей — когда и сколько клиент платит. Он попадёт и в договор, и в медиаплан.",
  },
  {
    icon: "Building2",
    color: "bg-blue-50 text-blue-600",
    title: "3. Внесите реквизиты клиента",
    text: "Кнопка «Реквизиты»: организация, ИНН, юридический адрес, банк и подписант. Эти данные подставляются в договор автоматически.",
  },
  {
    icon: "FileSignature",
    color: "bg-purple-50 text-purple-600",
    title: "4. Сформируйте договор",
    text: "Кнопка «Сформировать договор» — документ собирается за пару секунд. Значок конверта рядом с файлом отправит его клиенту на почту.",
  },
  {
    icon: "ArrowRightLeft",
    color: "bg-rose-50 text-rose-600",
    title: "5. Двигайте сделку по воронке",
    text: "Статус меняется списком справа: Новая → Смета → Договор → Оплата → Размещение → Завершена. Со статуса «Договор» ролик автоматически встаёт в медиаплан и занимает секунды на экране.",
  },
  {
    icon: "Wallet",
    color: "bg-emerald-50 text-emerald-600",
    title: "6. Отмечайте оплату",
    text: "Галочка на строке графика платежей — общая сумма оплаты считается сама. Просроченные платежи подсвечиваются в карточке.",
  },
];

const FEATURES = [
  {
    icon: "CalendarRange",
    title: "Медиаплан размещений",
    text: "Загрузка экрана по дням из 300 секунд, ролики по месяцам, выручка по годам. Выгружается в привычный Excel.",
  },
  {
    icon: "Users",
    title: "Клиентская база",
    text: "Контакты потенциальных клиентов по отраслям, воронка обзвона и подсказки: кому перезвонить, кто ушёл к конкурентам.",
  },
  {
    icon: "Radar",
    title: "Мониторинг конкурентов",
    text: "Маршрут объезда экранов, слежение за сайтами клиентов и поиск тендеров на наружную рекламу.",
  },
  {
    icon: "ShieldCheck",
    title: "Безопасность",
    text: "Журнал действий сотрудников, корзина удалённого на 30 дней и резервные копии базы раз в месяц.",
  },
];

export default function HelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-indigo-50/60 hover:bg-indigo-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Icon name="BookOpen" size={19} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-base">Как работать с системой</div>
            <div className="text-xs text-slate-600 mt-0.5">
              Краткая инструкция: от заявки до размещения на экране
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-xs font-medium text-indigo-700">
            {open ? "Свернуть" : "Открыть"}
          </span>
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-indigo-600" />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {STEPS.map(s => (
              <div key={s.title} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                    <Icon name={s.icon} size={15} />
                  </div>
                  <div className="font-medium text-slate-900 text-sm">{s.title}</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
              Что ещё умеет система
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-2.5">
                  <Icon name={f.icon} size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-slate-900">{f.title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Icon name="TriangleAlert" size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-amber-900">Важно помнить</div>
                <ul className="text-xs text-amber-800 leading-relaxed mt-1.5 space-y-1">
                  <li>· У каждого сотрудника свой логин и пароль. Не передавайте их коллегам: все действия записываются в журнал под вашим именем.</li>
                  <li>· Через 12 часов система выходит сама — нужно войти заново. Это защита, если компьютер остался без присмотра.</li>
                  <li>· Удалённая заявка попадает в корзину и хранится 30 дней — восстановить её можно в разделе «Безопасность».</li>
                  <li>· Выгрузка клиентской базы фиксируется в журнале. Руководитель видит, кто и когда её делал.</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full mt-4 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition"
          >
            <Icon name="ChevronUp" size={14} />
            Свернуть инструкцию
          </button>
        </div>
      )}
    </div>
  );
}