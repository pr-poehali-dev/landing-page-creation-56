const COMPARE_ROWS = [
  { param: "Стоимость в день", led: "от 1 625 ₽", board: "от 2 500 ₽", radio: "от 4 000 ₽" },
  { param: "Контактов в сутки", led: "до 40 000", board: "10–15 тыс.", radio: "зависит от эфира" },
  { param: "Запуск кампании", led: "1 день", board: "2–3 недели", radio: "3–5 дней" },
  { param: "Смена макета", led: "за 15 минут, бесплатно", board: "перепечатка, от 8 000 ₽", radio: "перезапись ролика" },
  { param: "Видно вечером", led: "да, экран светится", board: "только с подсветкой", radio: "—" },
  { param: "Динамика и видео", led: "да", board: "нет", radio: "только звук" },
  { param: "Отчёт о выходах", led: "фото и видео", board: "фотоотчёт раз в месяц", radio: "эфирная справка" },
];

export default function MapComparison() {
  return (
    <>
      <section className="fb-gray" id="map">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="fb-kicker">Где стоит экран</div>
            <h2>Океанский проспект, 16а</h2>
            <p className="fb-lead">Перекрёсток с улицей Семёновской — точка, через которую проходит весь центр города.</p>
          </div>
          <div className="fb-mapgrid">
            <div className="fb-mapbox">
              <iframe
                title="Карта расположения экрана Флэшборд"
                src="https://yandex.ru/map-widget/v1/?ll=131.885%2C43.119&z=16&pt=131.885,43.119,pm2rdm"
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
                  <p>Остановка «ТЦ Изумруд» (маршруты 15, 15к, 22, 29), БЦ Fresh Plaza, жилой массив центра.</p>
                </div>
              </div>
              <a className="fb-btn fb-dark" href="https://yandex.ru/maps/?text=Владивосток, Океанский проспект, 16а" target="_blank" rel="noopener noreferrer">Открыть в Яндекс.Картах</a>
            </div>
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="fb-wrap">
          <div className="fb-center" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="fb-kicker">Сравнение</div>
            <h2>Почему экран выгоднее билборда и радио</h2>
            <p className="fb-lead">Одинаковый бюджет — разный результат. Сравнили по параметрам, которые важны рекламодателю.</p>
          </div>
          <div className="fb-tablewrap">
            <table className="fb-table">
              <thead>
                <tr>
                  <th>Параметр</th>
                  <th className="fb-th-hot">LED-экран «Флэшборд»</th>
                  <th>Билборд 3×6</th>
                  <th>Радио</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td className="fb-td-param">{r.param}</td>
                    <td className="fb-td-hot">{r.led}</td>
                    <td>{r.board}</td>
                    <td>{r.radio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="fb-fine">Данные по билбордам и радио — усреднённые рыночные значения по Владивостоку на 2025 год.</div>
        </div>
      </section>
    </>
  );
}
