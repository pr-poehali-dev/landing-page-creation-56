import { useState, useMemo } from "react";
import { calcPlacement, plural, fmt, DURATIONS, MIN_DAYS, MAX_DAYS, CalcPreset } from "./pricing";

interface CalculatorHowFaqProps {
  onApply?: (preset: CalcPreset) => void;
}

const STEPS = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.4-.7L3 21l1.8-5.6A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" /></svg>,
    title: "Заявка или звонок",
    desc: "Оставляете заявку на сайте, в Telegram или звоните. В течение часа присылаем смету и свободные даты.",
    time: "5 минут",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8h20M7 4v4m10-4v4" /></svg>,
    title: "Ролик",
    desc: "Есть готовый — проверяем по техтребованиям. Нет — сделаем сами от 7 500 ₽, согласуем до запуска.",
    time: "от 1 дня",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /><path d="M10 9l4 2.5-4 2.5z" fill="currentColor" stroke="none" /></svg>,
    title: "Запуск на экране",
    desc: "Ролик встаёт в блок: выход каждые 5 минут, 204 раза в день, с 06:00 до 23:00. Пришлём фотоотчёт.",
    time: "в день обращения",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg>,
    title: "Отчётность",
    desc: "Фото- и видеофиксация выходов, акты, закрывающие документы. Работаем с юрлицами и ИП.",
    time: "весь период",
  },
];

const TECH_SPECS = [
  { v: "720×1080 px", l: "разрешение" },
  { v: "H.264", l: "кодек" },
  { v: "25 к/с", l: "частота кадров" },
  { v: "до 4 Мбит/с", l: "битрейт" },
  { v: "5–20 сек", l: "хронометраж" },
  { v: "Без звука", l: "экран уличный" },
];

const FAQS = [
  { q: "Сколько раз в день покажут мой ролик?", a: "Рекламный блок на экране — 300 секунд (5 минут). Ролик любой длины выходит в каждом цикле: это 204 выхода в день, более 6 000 выходов в месяц. Это гарантированный объём показов. Если рекламный блок заполнен не полностью, количество показов увеличивается. Например, если блок заполнен на 50%, количество показов будет удвоено.", open: true },
  { q: "Как быстро можно запуститься?", a: "При готовом ролике — в день обращения. Если ролика нет, производство занимает от 1 рабочего дня (простые динамические макеты) и стоит от 7 500 ₽." },
  { q: "Как вы подтверждаете, что реклама реально выходила?", a: "Присылаем качественный фото- и видеоотчёт с разных ракурсов (не технический), предоставляем отчёт о показах и закрывающие документы." },
  { q: "Какая аудитория у экрана?", a: "Точка на Океанском проспекте — одной из самых загруженных магистралей Владивостока: по нашей оценке, 18–25 тыс. автомобилей и 10–20 тыс. пешеходов в сутки. У экрана — остановка «ТЦ Изумруд» с 19 маршрутами автобусов и вход в ТЦ «Изумруд Плаза». Владивосток — лидер страны по автомобилизации, поэтому уличные экраны здесь особенно эффективны." },
  { q: "Можно ли разместиться меньше чем на 5 дней?", a: "Минимальный срок — 5 дней: за меньший период ролик не успевает набрать достаточную частоту контактов, и мы не рекомендуем так тратить бюджет." },
  { q: "Какие есть ограничения по контенту?", a: "Работаем в рамках закона «О рекламе»: не принимаем запрещённые к рекламе категории, для отдельных тематик (медицина, финансы) потребуются подтверждающие документы. Политическая реклама — по индивидуальному коэффициенту." },
  { q: "Есть ли скидки?", a: "Агентствам и при долгосрочных контрактах (от 3 месяцев) — индивидуальные условия. Арендаторам ТЦ «Изумруд Плаза» — специальный тариф." },
];

export default function CalculatorHowFaq({ onApply }: CalculatorHowFaqProps) {
  const [dur, setDur] = useState(10);
  const [days, setDays] = useState(30);

  const calc = useMemo(() => calcPlacement(dur, days), [dur, days]);

  function handleApply() {
    onApply?.({ duration: dur, days, price: calc.total, stamp: Date.now() });
  }

  return (
    <>
      <section className="fb-calcbg" id="calculator">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="fb-kicker">Калькулятор</div>
            <h2>Посчитайте свою кампанию за 20 секунд</h2>
          </div>
          <div className="fb-calc">
            <div className="fb-calcL">
              <div className="fb-lbl">Хронометраж ролика</div>
              <div className="fb-durs">
                {DURATIONS.map(d => (
                  <button key={d} className={`fb-dur${dur === d ? " fb-on" : ""}`} onClick={() => setDur(d)}>{d}″</button>
                ))}
              </div>
              <div className={`fb-warn${dur > 15 ? " fb-show" : ""}`}>Для роликов длиннее 15″ действует коэффициент ×1,25</div>
              <div className="fb-rowbtw">
                <div className="fb-lbl" style={{ margin: 0 }}>Срок размещения</div>
                <div className="fb-dv">{days} {plural(days, "день", "дня", "дней")}</div>
              </div>
              <input type="range" min={MIN_DAYS} max={MAX_DAYS} step={5} value={days} onChange={e => setDays(+e.target.value)} />
              <div className="fb-rl"><span>{MIN_DAYS} дней</span><span>{MAX_DAYS} дней</span></div>
            </div>
            <div className="fb-calcR">
              <div className="fb-crk">✦ Ваша кампания</div>
              <div style={{ marginTop: 6 }}>
                <div className="fb-crow"><span>Размещение, {days} дн. × {dur}″</span><b>{fmt(calc.placement)}</b></div>
                <div className="fb-crow"><span>Выходов ролика на экране</span><b>{calc.outputs.toLocaleString("ru-RU")}</b></div>
                <div className="fb-crow"><span>Потенциальных контактов</span><b>~{calc.contacts.toLocaleString("ru-RU")}</b></div>
                <div className="fb-crow fb-cpt"><span>Цена 1000 показов</span><b>~{Math.round(calc.cpt)} ₽</b></div>
              </div>
              <div className="fb-ctotal" style={{ flex: 1 }} />
              <div className="fb-ctotal">
                <div className="fb-l">Итого</div>
                <div className="fb-v">{fmt(calc.total)}</div>
                <a className="fb-btn" href="#lead" onClick={handleApply}>Забронировать этот расчёт</a>
                <div className="fb-cdisc">Расчёт предварительный, не является офертой. Точную смету пришлём в течение часа.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="fb-kicker">Как это работает</div>
            <h2>От заявки до первого выхода — один день</h2>
          </div>
          <div className="fb-steps">
            {STEPS.map((s, i) => (
              <div className="fb-step" key={i}>
                <div className="fb-stepnum">Шаг {i + 1}</div>
                <div className="fb-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="fb-steptime">{s.time}</span>
              </div>
            ))}
          </div>
          <div className="fb-tech">
            <div>
              <h3>Технические требования к видео</h3>
              <p>Экран вертикальный, 5,76 × 8,64 м. Если ваше видео горизонтальное — адаптируем бесплатно при заказе от 30 дней.</p>
            </div>
            <div className="fb-techgrid">
              {TECH_SPECS.map((t, i) => (
                <div className="fb-tcell" key={i}><b>{t.v}</b><div>{t.l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="fb-gray" id="faq">
        <div className="fb-wrap">
          <div className="fb-center">
            <div className="fb-kicker">Вопросы и ответы</div>
            <h2>Что спрашивают перед размещением</h2>
          </div>
          <div className="fb-faqbox">
            {FAQS.map((f, i) => (
              <details key={i} open={f.open}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}