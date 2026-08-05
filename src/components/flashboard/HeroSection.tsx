import heroImage from "@/assets/flashboard-hero.jpg";

interface HeroSectionProps {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const NAV_LINKS = [
  { href: "#audience", label: "Аудитория" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#how", label: "Как работает" },
  { href: "#faq", label: "Вопросы" },
];

const TICKER_ITEMS = [
  "Ролик каждые 5 минут — 204 выхода в день",
  "Океанский проспект — «красная зона» трафика: люди смотрят экран, стоя в пробке",
  "Конечная остановка 4 маршрутов у экрана — в т.ч. на остров Русский",
  "Фото- и видеоотчёт о каждом выходе",
  "Производство ролика от 7 500 ₽",
];

export default function HeroSection({ scrolled, menuOpen, setMenuOpen }: HeroSectionProps) {
  return (
    <>
      <header id="hdr" className={scrolled ? "fb-scrolled" : ""}>
        <div className="fb-hbar">
          <a className="fb-logo" href="#top">
            <b>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="14" rx="2" stroke="#fff" strokeWidth="2" />
                <circle cx="8" cy="9" r="1" fill="#fff" />
                <circle cx="12" cy="9" r="1" fill="#fff" />
                <circle cx="16" cy="9" r="1" fill="#fff" />
                <circle cx="8" cy="13" r="1" fill="#fff" />
                <circle cx="12" cy="13" r="1" fill="#fff" />
              </svg>
            </b>
            Флэшборд
          </a>
          <nav>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
          <div className="fb-hct">
            <a className="fb-tel" href="tel:+74232925020">8 (423) 292-50-20</a>
            <a className="fb-btn" href="#lead">Разместить рекламу</a>
          </div>
          <button className="fb-burger" aria-label="Меню" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
        <div className={`fb-mobmenu${menuOpen ? " fb-open" : ""}`}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href="tel:+74232925020" onClick={() => setMenuOpen(false)}><b>8 (423) 292-50-20</b></a>
          <a className="fb-btn" href="#lead" style={{ textAlign: "center" }} onClick={() => setMenuOpen(false)}>Разместить рекламу</a>
        </div>
      </header>

      <div className="fb-hero" id="top">
        <div className="fb-wrap">
          <div>
            <div className="fb-badge">📍 ТЦ «Изумруд Плаза» · Океанский пр-т, 16а</div>
            <h1>Вашу рекламу увидят до <span className="fb-grad">40 000 человек</span> каждый день</h1>
            <p className="fb-sub">LED-экран 50 м² над входом в ТЦ «Изумруд Плаза» — на главной магистрали Владивостока. Ролик выходит каждые 5 минут с 06:00 до 23:00. Запуск за 1 день.</p>
            <div className="fb-cta">
              <a className="fb-btn" href="#lead">Разместить рекламу — от 1 625 ₽/день</a>
              <a className="fb-btn fb-ghost" href="#calculator">Рассчитать стоимость</a>
            </div>
            <div className="fb-stats">
              <div className="fb-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <div className="fb-v">40 000</div>
                <div className="fb-l">контактов в сутки</div>
              </div>
              <div className="fb-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <div className="fb-v">5 мин</div>
                <div className="fb-l">каждый цикл — ваш ролик</div>
              </div>
              <div className="fb-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M17 2l-5 5-5-5" /></svg>
                <div className="fb-v">17 ч</div>
                <div className="fb-l">вещания ежедневно</div>
              </div>
            </div>
          </div>
          <div className="fb-heroimg">
            <img src={heroImage} alt="Уличный экран Флэшборд на ТЦ Изумруд Плаза, Владивосток" />
            <div className="fb-imgcap">
              <div className="fb-t">Размер экрана</div>
              <div className="fb-b">5,76 × 8,64 м · видимость до 80 м</div>
            </div>
          </div>
        </div>
        <div className="fb-tickerwrap">
          <div className="fb-ticker">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i}>{item} ·</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
