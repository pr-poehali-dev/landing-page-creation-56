import { useState } from "react";
import Icon from "@/components/ui/icon";

const STEPS = [
  {
    icon: "Inbox",
    color: "bg-slate-100 text-slate-600",
    title: "1. Заявка приходит сама",
    text: "Когда клиент заполняет форму на сайте, заявка сразу появляется здесь со статусом «Новая». Имя, телефон и пожелания уже внутри — ничего вносить вручную не нужно.",
  },
  {
    icon: "CalendarRange",
    color: "bg-amber-50 text-amber-600",
    title: "2. Заполните условия сделки",
    text: "Кнопка «Условия» в карточке: стоимость, даты размещения, хронометраж ролика. Без стоимости счёт и акт сформировать нельзя — система предупредит заранее.",
  },
  {
    icon: "Building2",
    color: "bg-blue-50 text-blue-600",
    title: "3. Внесите реквизиты клиента",
    text: "Кнопка «Реквизиты»: название организации, ИНН, юридический адрес, банк и подписант. Эти данные подставляются в договор автоматически.",
  },
  {
    icon: "FileSignature",
    color: "bg-purple-50 text-purple-600",
    title: "4. Сформируйте документы",
    text: "Три кнопки: договор, счёт и акт. Документ собирается за пару секунд, открывается сразу и остаётся в карточке. Суммы прописываются прописью, нумерация ведётся автоматически.",
  },
  {
    icon: "Wallet",
    color: "bg-emerald-50 text-emerald-600",
    title: "5. Отмечайте оплату",
    text: "Кнопка «Указать оплату» — вносите полученную сумму. Полоса показывает, сколько внесено и сколько осталось: «Не оплачено», «Частично» или «Оплачено».",
  },
  {
    icon: "ArrowRightLeft",
    color: "bg-rose-50 text-rose-600",
    title: "6. Двигайте сделку по воронке",
    text: "Статус меняется списком в правом углу карточки: Новая → Смета → Договор → Оплата → Эфир → Завершена. Кнопки сверху фильтруют заявки по статусу.",
  },
];

const FEATURES = [
  {
    icon: "CircleCheck",
    title: "Подсказка о недостающих данных",
    text: "В каждой карточке система сама пишет, чего не хватает для документов, и какие поля нужно заполнить.",
  },
  {
    icon: "FolderOpen",
    title: "Все документы в одном списке",
    text: "Раздел «Все документы» собирает договоры, счета и акты с поиском по клиенту и фильтром по типу.",
  },
  {
    icon: "DatabaseBackup",
    title: "Резервные копии базы",
    text: "Раздел «Резервные копии» выгружает все заявки и документы в Excel. Рекомендуем делать копию раз в месяц.",
  },
  {
    icon: "ChartNoAxesColumn",
    title: "Сумма сделок в работе",
    text: "Вверху видно общую сумму активных сделок без учёта завершённых и потерянных.",
  },
];

export default function HelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Icon name="BookOpen" size={18} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900 text-sm">Как работать с системой</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Краткая инструкция: от заявки до закрывающих документов
            </div>
          </div>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-slate-400" />
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
                  <li>· Удаление заявки необратимо — вместе с ней пропадают ссылки на её документы. Если заявка может понадобиться для отчётности, ставьте статус «Потеряна».</li>
                  <li>· Готовые документы открываются по ссылке сколько угодно раз. Формировать заново нужно только если изменились данные.</li>
                  <li>· Вход в систему защищён паролем. Не передавайте его посторонним — доступ открывает все реквизиты клиентов.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
