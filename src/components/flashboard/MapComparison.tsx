const ADVANTAGES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
    title: "Быстрая замена ролика",
    desc: "Бесплатно, без затрат на перепечатку макета",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    title: "Запуск кампании",
    desc: "1 день от заявки до первого выхода",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 2v4m8-4v4" /></svg>,
    title: "Любой срок размещения",
    desc: "От 5 дней — гибко под вашу задачу",
  },
];

export default function MapComparison() {
  return (
    <>
      <section className="fb-gray" id="map">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="fb-kicker">Где расположен экран</div>
            <h2>Океанский проспект, 16а</h2>
            <p className="fb-lead">Перекрёсток с улицей Семёновской — точка, в которой сходятся интенсивные автомобильные, автобусные и пешеходные потоки со всего центра Владивостока.</p>
          </div>
          <div className="fb-mapgrid">
            <div className="fb-mapbox">
              <iframe
                title="Карта расположения экрана Флэшборд"
                src="https://yandex.ru/map-widget/v1/?text=%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D0%BA%2C%20%D0%9E%D0%BA%D0%B5%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2C%2016%D0%B0&z=17"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="fb-mapinfo">
              <div className="fb-mapitem">
                <div className="fb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <b>Адрес</b>
                  <p>г. Владивосток, Океанский пр-т, 16а — фасад ТЦ «Изумруд Плаза», над главным входом.</p>
                </div>
              </div>
              <div className="fb-mapitem">
                <div className="fb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
                <div>
                  <b>Зона видимости</b>
                  <p>До 80 метров по проспекту в обе стороны, полный обзор с перекрёстка Семёновской и с остановки.</p>
                </div>
              </div>
              <div className="fb-mapitem">
                <div className="fb-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M3 17l-1 4m19-4l1 4M7 21h10" /></svg>
                </div>
                <div>
                  <b>Что рядом</b>
                  <p>Остановка «ТЦ Изумруд» (19 маршрутов автобусов), ТЦ «Изумруд Плаза», БЦ Fresh Plaza, жилой массив центра.</p>
                </div>
              </div>
              <a className="fb-btn fb-dark" href="https://yandex.ru/maps/?text=ТЦ Изумруд Плаза Владивосток" target="_blank" rel="noopener noreferrer">Открыть в Яндекс.Картах</a>
            </div>
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="fb-kicker">Преимущества</div>
            <h2>Почему медиафасад выгоднее других видов наружной рекламы</h2>
          </div>
          <div className="fb-cards fb-cards-3" style={{ marginTop: 32 }}>
            {ADVANTAGES.map((a, i) => (
              <div className="fb-card" key={i}>
                <div className="fb-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}