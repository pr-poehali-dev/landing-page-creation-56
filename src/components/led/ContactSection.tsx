import { useState } from "react";
import { Reveal } from "./shared";

interface ContactSectionProps {
  scrollTo: (id: string) => void;
}

export default function ContactSection({ scrollTo }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: "", phone: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const footerLinks = [
    { id: "formats", label: "Форматы" },
    { id: "advantages", label: "Преимущества" },
    { id: "prices", label: "Цены" },
    { id: "contact", label: "Контакты" },
  ];

  return (
    <>
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
            {footerLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
            ))}
          </div>
          <div className="led-footer__copy">
            <span>© 2025 LED-экран «Изумруд». Все права защищены.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
