import { useState } from "react";

export default function LeadFooter() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(
      `Заявка с сайта «Флэшборд»\nИмя: ${name}\nТелефон: ${phone}\nКомментарий: ${comment || "—"}`
    );
    window.open(`https://wa.me/79089925020?text=${text}`, "_blank");
  }

  return (
    <>
      <section id="lead">
        <div className="fb-wrap">
          <div className="fb-leadcard">
            <div className="fb-leadL">
              <h2>Забронируйте место в рекламном блоке</h2>
              <p>Оставьте заявку — в течение часа в рабочее время пришлём смету, свободные даты и пример ролика под ваш бизнес.</p>
              <a className="fb-citem" href="tel:+74232925020">
                <span className="fb-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
                </span>
                <span><span className="fb-t">Телефон</span><br /><span className="fb-b">8 (423) 292-50-20</span></span>
              </a>
              <a className="fb-citem" href="https://wa.me/79089925020" target="_blank" rel="noopener noreferrer">
                <span className="fb-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.4-.7L3 21l1.8-5.6A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" /></svg>
                </span>
                <span><span className="fb-t">WhatsApp</span><br /><span className="fb-b">+7 (908) 992-50-20</span></span>
              </a>
              <div className="fb-trust">Работаем с юридическими лицами и ИП. Договор, акты, отчёт о выходах, помощь с маркировкой рекламы (erid) — всё включено.</div>
            </div>
            <div className="fb-leadR">
              <form onSubmit={handleSubmit}>
                <div className="fb-fld">
                  <label>Ваше имя</label>
                  <input type="text" required placeholder="Как к вам обращаться" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="fb-fld">
                  <label>Телефон</label>
                  <input type="tel" required placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="fb-fld">
                  <label>Что рекламируем? <i>(необязательно)</i></label>
                  <textarea placeholder="Например: открытие автосервиса на Семёновской, нужны водители с Океанского" value={comment} onChange={e => setComment(e.target.value)} />
                </div>
                <button type="submit" className="fb-btn">Получить смету за 1 час →</button>
                <div className="fb-pp">Нажимая кнопку, вы соглашаетесь на обработку персональных данных. Заявка откроется в WhatsApp — ничего не потеряется.</div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="fb-wrap fb-fgrid">
          <div>
            <a className="fb-logo" href="#top" style={{ marginBottom: 16 }}>
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
            <p style={{ marginTop: 14, lineHeight: 1.6 }}>Реклама на уличных экранах Владивостока. Оператор — коммуникационная группа Pacific Media.</p>
          </div>
          <div>
            <div className="fb-fh">Контакты</div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              г. Владивосток, Океанский пр-т, 16а, ТЦ «Изумруд Плаза»
            </div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
              <a href="tel:+74232925020">8 (423) 292-50-20</a>
            </div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.4-.7L3 21l1.8-5.6A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" /></svg>
              <a href="https://wa.me/79089925020">WhatsApp: +7 (908) 992-50-20</a>
            </div>
          </div>
          <div>
            <div className="fb-fh">Экран работает</div>
            <div className="fb-fr">Ежедневно, 06:00–23:00</div>
            <div className="fb-fr">Рекламный блок — каждые 5 минут</div>
            <div className="fb-copy">© {new Date().getFullYear()} Pacific Media · Флэшборд. Цены на сайте не являются публичной офертой.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
