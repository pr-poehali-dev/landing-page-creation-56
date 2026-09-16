interface StickyBarProps {
  visible: boolean;
}

export default function StickyBar({ visible }: StickyBarProps) {
  return (
    <div className={`fb-sticky${visible ? " fb-sticky-on" : ""}`}>
      <a className="fb-sticky-btn fb-sticky-call" href="tel:+79089925020" aria-label="Позвонить">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
      </a>
      <a className="fb-sticky-btn fb-sticky-tg" href="https://t.me/izumrudvlpm" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5L2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8s.7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.9l3.1-14.6c.3-1.3-.5-1.9-1.6-1.5zM8.5 13.9l9.8-6.2c.5-.3.9-.1.6.2l-8.1 7.3-.3 3.3-1.5-4.6z" /></svg>
      </a>
      <a className="fb-sticky-btn fb-sticky-lead" href="#lead">Оставить заявку</a>
    </div>
  );
}