const COMPARE_ROWS = [
  {
    label: "Запуск кампании",
    screen: "1 день от заявки",
    banner: "5–10 дней на печать и монтаж",
  },
  {
    label: "Замена макета",
    screen: "Бесплатно, в тот же день",
    banner: "Новая печать и оплата монтажа",
  },
  {
    label: "Минимальный срок",
    screen: "От 5 дней",
    banner: "Обычно от 1 месяца",
  },
  {
    label: "Видно в тёмное время",
    screen: "Да, собственное свечение",
    banner: "Только при внешней подсветке",
  },
  {
    label: "Отчётность",
    screen: "Фото- и видеофиксация",
    banner: "Как правило, только фото",
  },
  {
    label: "Формат подачи",
    screen: "Видео и анимация",
    banner: "Статичная картинка",
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
                src="https://yandex.ru/map-widget/v1/?ll=131.886687%2C43.118181&z=17&pt=131.886687,43.118181,pm2rdm"
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
          <div className="fb-cmp">
            <div className="fb-cmp-head">
              <div />
              <div className="fb-cmp-us">
                <span className="fb-cmp-badge">Медиафасад «Флэшборд»</span>
              </div>
              <div className="fb-cmp-them">Биллборд</div>
            </div>
            {COMPARE_ROWS.map((r) => (
              <div className="fb-cmp-row" key={r.label}>
                <div className="fb-cmp-lbl">{r.label}</div>
                <div className="fb-cmp-us">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>{r.screen}</span>
                </div>
                <div className="fb-cmp-them">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  <span>{r.banner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}