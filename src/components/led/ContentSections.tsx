import { Reveal } from "./shared";

interface ContentSectionsProps {
  scrollTo: (id: string) => void;
}

export default function ContentSections({ scrollTo }: ContentSectionsProps) {
  return (
    <>
      {/* FORMATS */}
      <section className="led-formats" id="formats">
        <div className="led-container">
          <Reveal>
            <span className="led-section-label">Форматы</span>
            <h2 className="led-section-title">Что можно разместить</h2>
            <p className="led-section-intro">Экран поддерживает любые форматы контента — от простого статичного изображения до полноценного видеоролика. При необходимости поможем с созданием материала.</p>
          </Reveal>
          <div className="led-formats__grid">
            {[
              { featured: true, icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, title: "Видеоролик", desc: "Самый эффективный формат. Привлекает максимальное внимание — движение и яркость притягивают взгляд даже краем зрения.", meta: ["5–30 секунд", "MP4, MOV"] },
              { featured: false, icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, title: "Статичный баннер", desc: "Классический формат. Отлично подходит для имиджевой рекламы, акций, контактной информации. Высокая яркость — виден в любую погоду.", meta: ["JPG, PNG", "от 72 dpi"] },
              { featured: false, icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: "Анимация (GIF/HTML5)", desc: "Золотая середина. Движение без полноценного видео — идеально для акций, обратного отсчёта, смены кадров и анимированных логотипов.", meta: ["GIF, HTML5", "до 15 секунд"] },
              { featured: false, icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>, title: "Бегущая строка", desc: "Самый бюджетный вариант. Текстовое сообщение, цены, акция, телефон — информирует прохожих в потоке по минимальной цене.", meta: ["Текст", "Самый низкий тариф"] },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className={`led-format-card${f.featured ? " led-format-card--featured" : ""}`}>
                  <div className="led-format-card__icon">{f.icon}</div>
                  <h3 className="led-format-card__title">{f.title}</h3>
                  <p className="led-format-card__desc">{f.desc}</p>
                  <div className="led-format-card__meta">
                    <span>{f.meta[0]}</span><span>·</span><span>{f.meta[1]}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="led-advantages" id="advantages">
        <div className="led-container">
          <Reveal>
            <span className="led-section-label">Почему это работает</span>
            <h2 className="led-section-title">Преимущества<br />LED-рекламы</h2>
          </Reveal>
          <div className="led-adv__grid">
            {[
              { num: "01", title: "Охват без таргетинга", desc: "В отличие от интернет-рекламы, LED-экран видят все: пешеходы, водители, пассажиры. Никаких алгоритмов — только живые глаза на вашей рекламе." },
              { num: "02", title: "Видно 24/7 в любую погоду", desc: "Яркость >7000 кд/м² — ролик виден даже при прямом солнце. Дождь, туман, сумерки: экран работает всегда." },
              { num: "03", title: "Гибкость контента", desc: "Хотите изменить ролик? Обновление занимает несколько минут. Разные ролики утром и вечером, сезонные акции — без дополнительных затрат." },
              { num: "04", title: "Дешевле билбордов", desc: "Цена контакта с аудиторией ниже, чем у статичных щитов 3×6 и перетяжек. При этом эффект ощутимо сильнее — движение и свет привлекают внимание." },
              { num: "05", title: "Доверие бренда растёт", desc: "Уличный экран создаёт образ серьёзной компании. Покупатели больше доверяют бизнесу, который они «видели в городе»." },
              { num: "06", title: "Запуск за 24 часа", desc: "Отправьте материал сегодня — ваша реклама выйдет уже завтра. Принимаем готовые ролики или разработаем макет сами." },
            ].map((a, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="led-adv-card">
                  <div className="led-adv-card__num">{a.num}</div>
                  <h3 className="led-adv-card__title">{a.title}</h3>
                  <p className="led-adv-card__desc">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="led-how" id="how">
        <div className="led-container">
          <Reveal>
            <span className="led-section-label">Процесс</span>
            <h2 className="led-section-title">Как разместить рекламу</h2>
          </Reveal>
          <div className="led-how__steps">
            {[
              { num: "1", title: "Оставьте заявку", desc: "Заполните форму или позвоните — обсудим ваши цели и подберём оптимальный пакет." },
              { num: "2", title: "Согласуйте даты и ролик", desc: "Выберите период размещения и пришлите готовый материал. Нет ролика — поможем с созданием." },
              { num: "3", title: "Оплатите", desc: "Выставим счёт. Принимаем наличные, перевод на карту, безналичный расчёт для юрлиц." },
              { num: "4", title: "Ваша реклама в эфире", desc: "Запускаем! Вы можете лично убедиться — приезжайте к магазину «Изумруд»." },
            ].map((step, i, arr) => (
              <span key={i} style={{ display: "contents" }}>
                <Reveal delay={i * 80}>
                  <div className="led-how-step">
                    <div className="led-how-step__num">{step.num}</div>
                    <div>
                      <h3 className="led-how-step__title">{step.title}</h3>
                      <p className="led-how-step__desc">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
                {i < arr.length - 1 && <div className="led-how-step__arrow" aria-hidden="true">→</div>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRICES */}
      <section className="led-prices" id="prices">
        <div className="led-container">
          <Reveal>
            <span className="led-section-label">Тарифы</span>
            <h2 className="led-section-title">Прозрачные цены</h2>
            <p className="led-section-intro">Без скрытых платежей. Выберите подходящий формат или свяжитесь для расчёта индивидуального предложения.</p>
          </Reveal>
          <div className="led-prices__grid">
            <Reveal delay={0}>
              <div className="led-price-card">
                <div className="led-price-card__header">
                  <span className="led-price-card__name">Старт</span>
                  <div className="led-price-card__price">
                    <span className="led-price-num">от 3 000</span>
                    <span className="led-price-unit">₽ / день</span>
                  </div>
                </div>
                <ul className="led-price-card__features" role="list">
                  <li>Статичный баннер или бегущая строка</li>
                  <li>10 показов в час</li>
                  <li>Ролик 5–10 секунд</li>
                  <li>Размещение от 1 дня</li>
                </ul>
                <a href="#contact" className="led-btn led-btn--outline led-btn--full" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Выбрать</a>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="led-price-card led-price-card--featured">
                <div className="led-price-card__badge">Популярный</div>
                <div className="led-price-card__header">
                  <span className="led-price-card__name">Бизнес</span>
                  <div className="led-price-card__price">
                    <span className="led-price-num">от 7 000</span>
                    <span className="led-price-unit">₽ / день</span>
                  </div>
                </div>
                <ul className="led-price-card__features" role="list">
                  <li>Видеоролик или анимация</li>
                  <li>20 показов в час</li>
                  <li>Ролик до 15 секунд</li>
                  <li>Размещение от 7 дней</li>
                  <li>Помощь с контентом</li>
                </ul>
                <a href="#contact" className="led-btn led-btn--primary led-btn--full" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Выбрать</a>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="led-price-card">
                <div className="led-price-card__header">
                  <span className="led-price-card__name">Максимум</span>
                  <div className="led-price-card__price">
                    <span className="led-price-num">Индивидуально</span>
                  </div>
                </div>
                <ul className="led-price-card__features" role="list">
                  <li>Полное доминирование на экране</li>
                  <li>До 40 показов в час</li>
                  <li>Ролик до 30 секунд</li>
                  <li>Долгосрочные контракты</li>
                  <li>Разработка ролика включена</li>
                  <li>Персональный менеджер</li>
                </ul>
                <a href="#contact" className="led-btn led-btn--outline led-btn--full" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Рассчитать</a>
              </div>
            </Reveal>
          </div>
          <p className="led-prices__note">* Итоговая стоимость зависит от периода размещения, количества показов и формата контента. Уточняйте у менеджера.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="led-testimonials" id="testimonials">
        <div className="led-container">
          <Reveal>
            <span className="led-section-label">Отзывы</span>
            <h2 className="led-section-title">Что говорят клиенты</h2>
          </Reveal>
          <div className="led-testimonials__grid">
            {[
              { initials: "АК", text: "«Разместили рекламу кафе на три недели — поток новых клиентов вырос заметно. Несколько гостей прямо говорили: «Видели вас на экране у Изумруда». Считаю, это один из лучших рекламных инструментов в городе.»", name: "Андрей К.", company: "Кафе «Восток», Владивосток" },
              { initials: "МС", text: "«Запустили акцию на выходные — за два дня пришло больше людей, чем за неделю без рекламы. Быстро согласовали, быстро запустили. Теперь размещаемся регулярно.»", name: "Мария С.", company: "Магазин одежды «Формула», ВЛ" },
              { initials: "ДП", text: "«Отличная видимость! Мы продаём авто, и нам важно, чтобы имя салона знали в городе. LED-экран создаёт солидный образ — клиенты приходят уже «подогретые».»", name: "Дмитрий П.", company: "Автосалон «Приморье Авто»" },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <blockquote className="led-testimonial-card">
                  <p className="led-testimonial-card__text">{t.text}</p>
                  <footer className="led-testimonial-card__footer">
                    <div className="led-testimonial-card__avatar" aria-hidden="true">{t.initials}</div>
                    <div>
                      <cite className="led-testimonial-card__name">{t.name}</cite>
                      <span className="led-testimonial-card__company">{t.company}</span>
                    </div>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="led-cta-banner">
        <div className="led-container led-cta-banner__inner">
          <div className="led-cta-banner__text">
            <h2 className="led-cta-banner__title">Готовы запустить рекламу?</h2>
            <p className="led-cta-banner__sub">Оставьте заявку — перезвоним в течение 30 минут и согласуем даты.</p>
          </div>
          <a href="#contact" className="led-btn led-btn--primary led-btn--lg" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Оставить заявку</a>
        </div>
      </section>
    </>
  );
}
