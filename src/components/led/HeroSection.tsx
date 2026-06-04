import { useState, useEffect } from "react";
import { Reveal } from "./shared";

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

interface HeroSectionProps {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  scrollTo: (id: string) => void;
}

export default function HeroSection({ scrolled, menuOpen, setMenuOpen, scrollTo }: HeroSectionProps) {
  const navLinks = [
    { id: "formats", label: "Форматы" },
    { id: "advantages", label: "Преимущества" },
    { id: "prices", label: "Цены" },
    { id: "contact", label: "Контакты" },
  ];

  return (
    <>
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
    </>
  );
}
