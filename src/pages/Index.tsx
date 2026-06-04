import { useState, useEffect, useRef } from "react";

const SLOGANS = [
  { tag: "ВАША РЕКЛАМА", headline: "Магазин одежды", brand: "NOVA", sub: "Новая коллекция уже здесь" },
  { tag: "АКЦИЯ", headline: "Суши-бар", brand: "ОКЕАН", sub: "Скидка 30% каждый вторник" },
  { tag: "ОТКРЫТИЕ", headline: "Фитнес-клуб", brand: "СИЛА", sub: "Первый месяц бесплатно" },
  { tag: "РЕКЛАМА", headline: "Автосалон", brand: "АВТО+", sub: "Trade-in по выгодным условиям" },
];

const TICKER_ITEMS = [
  "Рестораны и кафе", "Автосалоны", "Торговые центры", "Фитнес-клубы",
  "Застройщики", "Медицинские клиники", "Магазины одежды", "Банки и МФО",
];

function ScreenMockup() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % SLOGANS.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const s = SLOGANS[idx];
  return (
    <div className="led-hero__screen-mockup">
      <div className="led-screen-frame">
        <div className="led-screen-display">
          <div className="led-screen-content" style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.96)" }}>
            <span className="led-screen-tag">{s.tag}</span>
            <p className="led-screen-headline">
              {s.headline}<br /><strong>{s.brand}</strong>
            </p>
            <p className="led-screen-sub">{s.sub}</p>
          </div>
          <div className="led-screen-scanlines" />
        </div>
      </div>
      <div className="led-screen-mount" />
    </div>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`led-reveal${visible ? " visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", phone: "", company: "", message: "" });
      setTimeout(() => setSubmitted(false), 6000);
    }, 1200);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  const navLinks = [
    { id: "formats", label: "Форматы" },
    { id: "advantages", label: "Преимущества" },
    { id: "prices", label: "Цены" },
    { id: "contact", label: "Контакты" },
  ];

  return (
    <div id="led-landing">
      {/* HEADER */}
      <header className={`led-header${scrolled ? " led-header--scrolled" : ""}`}>
        <div className="led-container led-header__inner">
          <a href="#" className="led-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect width="36" height="36" rx="6" fill="#FF5F1F"/>
              <rect x="7" y="7" width="10" height="22" rx="2" fill="white"/>
              <rect x="19" y="7" width="10" height="10" rx="2" fill="white" opacity="0.85"/>
              <rect x="19" y="20" width="10" height="9" rx="2" fill="white" opacity="0.55"/>
            </svg>
            <span className="led-logo__text">LED «Изумруд»</span>
          </a>
          <nav className="led-nav" aria-label="Основная навигация">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} className="led-nav__link" onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
            ))}
          </nav>
          <a href="#contact" className="led-btn led-btn--primary led-btn--sm" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Оставить заявку</a>
          <button className="led-burger" aria-label="Открыть меню" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
        <div className={`led-mobile-nav${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          {navLinks.map(l => (
            <a key={l.id} href={`#${l.id}`} className="led-mobile-nav__link" onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
          ))}
          <a href="#contact" className="led-btn led-btn--primary" style={{ marginTop: "1rem" }} onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Оставить заявку</a>
        </div>
      </header>

      {/* HERO */}
      <section className="led-hero" id="hero">
        <div className="led-hero__bg" aria-hidden="true">
          <div className="led-hero__glow led-hero__glow--1" />
          <div className="led-hero__glow led-hero__glow--2" />
          <ScreenMockup />
        </div>
        <div className="led-container led-hero__content">
          <div className="led-hero__badge">
            <span className="led-badge-dot" />
            Владивосток · ул. Светланская
          </div>
          <h1 className="led-hero__title">
            Ваша реклама<br />на главном<br /><span className="led-accent">LED-экране</span><br />города
          </h1>
          <p className="led-hero__sub">Уличный светодиодный экран на магазине «Изумруд» — от&nbsp;20&nbsp;000 просмотров в сутки. Гибкие пакеты, запуск за 24 часа.</p>
          <div className="led-hero__actions">
            <a href="#contact" className="led-btn led-btn--primary led-btn--lg" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Заказать размещение</a>
            <a href="#prices" className="led-btn led-btn--ghost led-btn--lg" onClick={e => { e.preventDefault(); scrollTo("prices"); }}>Смотреть тарифы</a>
          </div>
          <div className="led-hero__stats">
            <div className="led-stat">
              <span className="led-stat__num">20 000+</span>
              <span className="led-stat__label">просмотров / сутки</span>
            </div>
            <div className="led-stat-divider" aria-hidden="true" />
            <div className="led-stat">
              <span className="led-stat__num">24 ч</span>
              <span className="led-stat__label">до запуска</span>
            </div>
            <div className="led-stat-divider" aria-hidden="true" />
            <div className="led-stat">
              <span className="led-stat__num">16 ч</span>
              <span className="led-stat__label">работа экрана в сутки</span>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="led-ticker" aria-label="Клиенты">
        <div className="led-ticker__track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].flatMap((item, i) => [
            <span key={`item-${i}`} className="led-ticker__item">{item}</span>,
            <span key={`sep-${i}`} className="led-ticker__sep" aria-hidden="true">·</span>,
          ])}
        </div>
      </div>

      {/* LOCATION */}
      <section className="led-location" id="location">
        <div className="led-container led-location__inner">
          <div className="led-location__text">
            <Reveal>
              <span className="led-section-label">Расположение</span>
              <h2 className="led-section-title">Топовое место<br />во Владивостоке</h2>
              <p className="led-section-body">Экран установлен на фасаде магазина «Изумруд» на одной из главных улиц города. Высокий автомобильный и пешеходный трафик, близость к светофору — водители и прохожие видят вашу рекламу несколько секунд при каждом проезде.</p>
              <ul className="led-location__list">
                <li className="led-location__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Центральный район, ул. Светланская</span>
                </li>
                <li className="led-location__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Режим работы: 07:00 — 23:00</span>
                </li>
                <li className="led-location__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Аудитория: 20 000+ уникальных контактов в сутки</span>
                </li>
                <li className="led-location__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                  <span>Размер экрана: 4 × 3 метра, разрешение HD</span>
                </li>
              </ul>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="led-map-card" aria-label="Карта расположения экрана">
              <div className="led-map-street" aria-hidden="true">
                <div className="led-street-h" />
                <div className="led-street-v" />
                <div className="led-building led-b1" />
                <div className="led-building led-b2" />
                <div className="led-building led-b3" />
                <div className="led-building led-b4" />
              </div>
              <div className="led-map-pin">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" aria-hidden="true">
                  <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#FF5F1F"/>
                  <circle cx="16" cy="16" r="7" fill="white"/>
                </svg>
              </div>
              <div className="led-map-info">
                <strong>LED-экран «Изумруд»</strong>
                <span>Магазин «Изумруд»</span>
                <span>Владивосток</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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

      {/* CONTACT */}
      <section className="led-contact" id="contact">
        <div className="led-container led-contact__inner">
          <div>
            <Reveal>
              <span className="led-section-label">Контакты</span>
              <h2 className="led-section-title">Свяжитесь с нами</h2>
              <p className="led-section-body">Ответим на вопросы, рассчитаем стоимость и забронируем даты для вашей рекламы.</p>
              <div className="led-contact__links">
                <a href="tel:+74231234567" className="led-contact__link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
                  +7 (423) 123-45-67
                </a>
                <a href="https://wa.me/74231234567" className="led-contact__link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="mailto:info@izumrud-led.ru" className="led-contact__link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  info@izumrud-led.ru
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <form className="led-contact__form" onSubmit={handleSubmit} noValidate>
              <div className="led-form-group">
                <label htmlFor="name" className="led-form-label">Ваше имя</label>
                <input type="text" id="name" name="name" className="led-form-input" placeholder="Иван Петров" autoComplete="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="led-form-group">
                <label htmlFor="phone" className="led-form-label">Телефон</label>
                <input type="tel" id="phone" name="phone" className="led-form-input" placeholder="+7 (___) ___-__-__" autoComplete="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="led-form-group">
                <label htmlFor="company" className="led-form-label">Компания / бизнес</label>
                <input type="text" id="company" name="company" className="led-form-input" placeholder="ООО «Название»" autoComplete="organization" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
              </div>
              <div className="led-form-group">
                <label htmlFor="message" className="led-form-label">Комментарий</label>
                <textarea id="message" name="message" className="led-form-textarea" rows={3} placeholder="Расскажите о вашей задаче, желаемых датах..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" className="led-btn led-btn--primary led-btn--full" disabled={submitting}>
                {submitting ? "Отправляем…" : "Отправить заявку"}
              </button>
              <p className="led-form-note">Нажимая кнопку, вы соглашаетесь с <a href="#" className="led-form-note__link">политикой конфиденциальности</a></p>
              {submitted && (
                <div className="led-form-success" aria-live="polite">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  Заявка отправлена! Перезвоним в течение 30 минут.
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="led-footer">
        <div className="led-container led-footer__inner">
          <div className="led-footer__brand">
            <a href="#" className="led-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect width="36" height="36" rx="6" fill="#FF5F1F"/>
                <rect x="7" y="7" width="10" height="22" rx="2" fill="white"/>
                <rect x="19" y="7" width="10" height="10" rx="2" fill="white" opacity="0.85"/>
                <rect x="19" y="20" width="10" height="9" rx="2" fill="white" opacity="0.55"/>
              </svg>
              <span className="led-logo__text">LED «Изумруд»</span>
            </a>
            <p className="led-footer__tagline">Светодиодный экран у магазина «Изумруд», Владивосток</p>
          </div>
          <div className="led-footer__links">
            {[{ id: "formats", label: "Форматы" }, { id: "advantages", label: "Преимущества" }, { id: "prices", label: "Цены" }, { id: "contact", label: "Контакты" }].map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
            ))}
          </div>
          <div className="led-footer__copy">
            <span>© 2025 LED-экран «Изумруд». Все права защищены.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
