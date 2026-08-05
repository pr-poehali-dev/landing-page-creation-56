const AUDIENCE_CARDS = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M6 17l1.5-5.5A2 2 0 0 1 9.4 10h5.2a2 2 0 0 1 1.9 1.5L18 17M7 17v2m10-2v2M7.5 13.5h9" /></svg>,
    title: "Магистраль «красной зоны»",
    desc: "Океанский проспект — одна из самых загруженных улиц города. В часы пик поток движется медленно: водители и пассажиры смотрят на экран подолгу.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M3 17l-1 4m19-4l1 4M7 21h10" /><circle cx="8" cy="13" r="1" fill="currentColor" /><circle cx="16" cy="13" r="1" fill="currentColor" /></svg>,
    title: "Конечная остановка 4 маршрутов",
    desc: "Остановка «ТЦ Изумруд» прямо под экраном — маршруты 15, 15к, 22, 29, включая связку с островом Русский. Люди ждут автобус лицом к экрану по 5–10 минут.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21V12h6v9" /></svg>,
    title: "Входная группа торгового центра",
    desc: "Экран висит над главным входом «Изумруд Плазы»: посетители ТЦ видят ролик в момент, когда уже настроены на покупки.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2.5" /><path d="M12 8v5m0 0l-3 7m3-7l3 7M8 11l4-2 4 2" /></svg>,
    title: "Плотный пешеходный поток",
    desc: "Перекрёсток с ул. Семёновской, бизнес-центр Fresh Plaza напротив, жилой массив вокруг — тысячи пешеходов ежедневно.",
  },
];

const PLANS = [
  {
    hot: false,
    name: "Старт",
    duration: "5 секунд",
    price: "1 625 ₽",
    perMonth: "48 750 ₽/мес",
    perThousand: "от 41 ₽ за 1000 контактов",
    features: ["204 выхода ролика в день", "Каждый цикл — каждые 5 минут", "Фотоотчёт о выходах", "Идеально для акций и анонсов"],
  },
  {
    hot: true,
    name: "Оптимум",
    duration: "10 секунд",
    price: "3 250 ₽",
    perMonth: "97 500 ₽/мес",
    perThousand: "полноценная подача оффера",
    features: ["204 выхода ролика в день", "Хватает на оффер + условия + адрес", "Видеоотчёт о выходах", "Приоритетная позиция в блоке"],
  },
  {
    hot: false,
    name: "Максимум",
    duration: "15–20 секунд",
    price: "от 4 875 ₽",
    perMonth: "от 146 250 ₽/мес",
    perThousand: "формат мини-ролика",
    features: ["204 выхода в день", "Сюжет с демонстрацией продукта", "Расширенный отчёт", "Помощь с производством ролика"],
  },
];

export default function AudiencePricing() {
  return (
    <>
      <section id="audience">
        <div className="fb-wrap">
          <div style={{ maxWidth: 640 }}>
            <div className="fb-kicker">Почему эта точка работает</div>
            <h2>Экран стоит там, где людям <span style={{ color: "var(--fb-rose)" }}>некуда деть глаза</span></h2>
            <p className="fb-lead">Владивосток — самый автомобильный город России: 566 машин на 1000 жителей. Уличный экран здесь видит больше людей, чем в любом другом городе страны.</p>
          </div>
          <div className="fb-grid2">
            <div className="fb-cards">
              {AUDIENCE_CARDS.map((c, i) => (
                <div className="fb-card" key={i}>
                  <div className="fb-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="fb-panel">
              <div className="fb-pk">Аудитория экрана</div>
              <div className="fb-prow"><span>Автомобилисты и пассажиры авто</span><b>19–31 тыс./сутки</b></div>
              <div className="fb-prow"><span>Пассажиры общественного транспорта</span><b>~4 тыс./сутки</b></div>
              <div className="fb-prow"><span>Пешеходы и посетители ТЦ</span><b>3–5 тыс./сутки</b></div>
              <div className="fb-ptotal"><span style={{ fontWeight: 600 }}>Итого потенциальных контактов</span><b>до 40 000</b></div>
              <div className="fb-note">✓ Оценка по транспортным и пешеходным потокам точки. Точные данные — по результатам замера, который проводим для крупных кампаний.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="fb-gray" id="pricing">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="fb-kicker">Тарифы</div>
            <h2>Цена понятна сразу — без медиапланов и скрытых доплат</h2>
            <p className="fb-lead">Рекламный блок — 5 минут, ваш ролик выходит в каждом: 204 раза в день, 6 120 раз в месяц.</p>
          </div>
          <div className="fb-plans">
            {PLANS.map((p, i) => (
              <div className={`fb-plan${p.hot ? " fb-hot" : ""}`} key={i}>
                {p.hot && <div className="fb-hotbadge">Выбирают чаще всего</div>}
                <div className="fb-nm" style={p.hot ? { color: "#fb7185" } : undefined}>{p.name}</div>
                <div className="fb-tm">{p.duration}</div>
                <div className="fb-pr"><b>{p.price}</b><span>в день</span></div>
                <div className="fb-pm">{p.perMonth}</div>
                <div className="fb-pc">{p.perThousand}</div>
                <ul>
                  {p.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <a className={`fb-btn${p.hot ? "" : " fb-dark"}`} href="#lead">Оставить заявку</a>
              </div>
            ))}
          </div>
          <div className="fb-fine">Минимальный срок размещения — 10 дней. Производство видеоролика под экран — от 7 500 ₽. Для агентств и сетевых клиентов — индивидуальные условия.</div>
        </div>
      </section>
    </>
  );
}
