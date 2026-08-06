interface StickyBarProps {
  visible: boolean;
}

export default function StickyBar({ visible }: StickyBarProps) {
  return (
    <div className={`fb-sticky${visible ? " fb-sticky-on" : ""}`}>
      <a className="fb-sticky-btn fb-sticky-call" href="tel:+74232925020">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
        Позвонить
      </a>
      <a className="fb-sticky-btn fb-sticky-wa" href="https://wa.me/79089925020" target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.4-.7L3 21l1.8-5.6A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" /></svg>
        WhatsApp
      </a>
      <a className="fb-sticky-btn fb-sticky-lead" href="#lead">Заявка</a>
    </div>
  );
}
