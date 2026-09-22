import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import func2url from "../../../backend/func2url.json";
import { COMPANY } from "./company";
import PrivacyModal from "./PrivacyModal";
import { calcPlacement, plural, fmt, MIN_DAYS, CalcPreset } from "./pricing";
import { endFromStart } from "../admin/dealDates";

interface LeadFooterProps {
  preset?: CalcPreset | null;
}

function formatPhone(value: string) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);

  let res = "+7";
  if (d.length > 1) res += " (" + d.slice(1, 4);
  if (d.length >= 4) res += ")";
  if (d.length > 4) res += " " + d.slice(4, 7);
  if (d.length > 7) res += "-" + d.slice(7, 9);
  if (d.length > 9) res += "-" + d.slice(9, 11);
  return res;
}

export default function LeadFooter({ preset }: LeadFooterProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [duration, setDuration] = useState("");
  const [days, setDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!preset) return;
    setDuration(String(preset.duration));
    setDays(String(preset.days));
    setSent(false);
  }, [preset]);

  const durNum = Number(duration) || 0;
  const daysNum = Number(days) || 0;
  const estimate = durNum > 0 && daysNum >= MIN_DAYS ? calcPlacement(durNum, daysNum) : null;
  const endDate = startDate && daysNum > 0 ? endFromStart(startDate, daysNum) : "";
  const period =
    startDate && endDate
      ? `${new Date(startDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} — ${new Date(endDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
      : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Отметьте согласие на обработку персональных данных");
      return;
    }
    if (phone.replace(/\D/g, "").length < 11) {
      setError("Введите телефон полностью");
      return;
    }
    setError("");
    setSending(true);

    const payload = {
      name,
      phone,
      comment,
      duration: duration ? Number(duration) : null,
      days: days ? Number(days) : null,
      totalPrice: estimate ? estimate.total : null,
      startDate: startDate || null,
      source: "form",
    };
    try {
      const res = await fetch(func2url.leads, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("fail");
      setSent(true);
      const text = encodeURIComponent(
        `Заявка с сайта «Флэшборд»\nИмя: ${name}\nТелефон: ${phone}` +
          `\nХронометраж: ${duration ? duration + " сек" : "—"}` +
          `\nСрок: ${days ? days + " дн." + (period ? ` (${period})` : "") : "—"}` +
          `\nПредварительно: ${estimate ? fmt(estimate.total) : "—"}` +
          `\nСтарт: ${startDate ? new Date(startDate).toLocaleDateString("ru-RU") : "—"}` +
          `\nКомментарий: ${comment || "—"}`
      );
      window.open(`https://t.me/izumrudvlpm?text=${text}`, "_blank");
      setName("");
      setPhone("");
      setComment("");
      setDuration("");
      setDays("");
      setStartDate("");
      setConsent(false);
    } catch {
      setError("Не удалось отправить. Позвоните нам: +7 908 992 50 20");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section id="lead">
        <div className="fb-wrap">
          <div className="fb-leadcard">
            <div className="fb-leadL">
              <h2>Забронируйте место в рекламном блоке</h2>
              <p>Оставьте заявку — в течение часа в рабочее время пришлём смету и свободные даты.</p>
              <a className="fb-citem" href="tel:+79089925020">
                <span className="fb-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
                </span>
                <span><span className="fb-t">Телефон</span><br /><span className="fb-b">+7 908 992 50 20</span></span>
              </a>
              <a className="fb-citem" href="https://t.me/izumrudvlpm" target="_blank" rel="noopener noreferrer">
                <span className="fb-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M21.5 3.5L2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8s.7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.9l3.1-14.6c.3-1.3-.5-1.9-1.6-1.5zM8.5 13.9l9.8-6.2c.5-.3.9-.1.6.2l-8.1 7.3-.3 3.3-1.5-4.6z" /></svg>
                </span>
                <span><span className="fb-t">Telegram</span><br /><span className="fb-b">@izumrudvlpm</span></span>
              </a>
              <a className="fb-citem" href="mailto:screen_izumrud@mail.ru">
                <span className="fb-ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>
                </span>
                <span><span className="fb-t">Почта</span><br /><span className="fb-b">screen_izumrud@mail.ru</span></span>
              </a>
              <div className="fb-trust">Работаем с юридическими лицами и ИП. Договор, акты, отчёт о выходах — всё включено.</div>
            </div>
            <div className="fb-leadR">
              {sent ? (
                <div className="fb-success">
                  <div className="fb-success-ic">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3>Заявка принята</h3>
                  <p>Мы сохранили ваши контакты и свяжемся в течение часа в рабочее время — пришлём смету и свободные даты.</p>
                  <button className="fb-btn fb-dark" onClick={() => setSent(false)}>Отправить ещё одну</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="fb-fld">
                    <label>Ваше имя</label>
                    <input type="text" required placeholder="Как к вам обращаться" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="fb-fld">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={e => setPhone(formatPhone(e.target.value))}
                      onFocus={() => { if (!phone) setPhone("+7 ("); }}
                    />
                  </div>
                  <div className="fb-two">
                    <div className="fb-fld">
                      <label>Хронометраж <i>(необяз.)</i></label>
                      <select value={duration} onChange={e => setDuration(e.target.value)}>
                        <option value="">Не знаю</option>
                        <option value="5">5 секунд</option>
                        <option value="10">10 секунд</option>
                        <option value="15">15 секунд</option>
                        <option value="20">20 секунд</option>
                        <option value="30">30 секунд</option>
                      </select>
                    </div>
                    <div className="fb-fld">
                      <label>Старт показов <i>(необяз.)</i></label>
                      <input
                        type="date"
                        value={startDate}
                        min={today}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="fb-fld">
                    <label>Срок размещения <i>(необяз.)</i></label>
                    <select value={days} onChange={e => setDays(e.target.value)}>
                      <option value="">Не знаю</option>
                      {[5, 7, 14, 30, 45, 60, 90].map(d => (
                        <option key={d} value={d}>{d} {plural(d, "день", "дня", "дней")}</option>
                      ))}
                    </select>
                  </div>
                  {estimate && (
                    <div className="fb-estimate">
                      <div className="fb-est-row">
                        <span>Примерная стоимость</span>
                        <b>{fmt(estimate.total)}</b>
                      </div>
                      <div className="fb-est-note">
                        {daysNum} {plural(daysNum, "день", "дня", "дней")} × {durNum}″ ·{" "}
                        {estimate.outputs.toLocaleString("ru-RU")} выходов
                        {period && <> · {period}</>}. Точную смету пришлём в течение часа.
                      </div>
                    </div>
                  )}
                  <div className="fb-fld">
                    <label>Что рекламируем? <i>(необязательно)</i></label>
                    <textarea placeholder="Например: открытие автосервиса на Семёновской, нужны водители с Океанского" value={comment} onChange={e => setComment(e.target.value)} />
                  </div>
                  <label className="fb-consent">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => { setConsent(e.target.checked); if (e.target.checked) setError(""); }}
                    />
                    <span>
                      Я согласен на обработку моих персональных данных (имя, телефон) и принимаю{" "}
                      <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setPrivacyOpen(true); }}>
                        политику конфиденциальности
                      </button>
                      .
                    </span>
                  </label>
                  {error && <div className="fb-formerr">{error}</div>}
                  <button type="submit" className="fb-btn" disabled={sending || !consent}>
                    {sending ? "Отправляем…" : "Получить смету за 1 час →"}
                  </button>
                  <div className="fb-pp">Заявка сохранится у нас и продублируется в Telegram. Мы не передаём контакты третьим лицам.</div>
                </form>
              )}
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
              <span translate="no">Флэшборд</span>
            </a>
            <p style={{ marginTop: 14, lineHeight: 1.6 }}>Реклама на уличных экранах Владивостока.</p>
            <div className="fb-req">
              {COMPANY.full}
              <br />ИНН {COMPANY.inn}
            </div>
            <div className="fb-legal-links">
              <Link to="/privacy" onClick={e => { e.preventDefault(); setPrivacyOpen(true); }}>
                Политика конфиденциальности
              </Link>
            </div>
          </div>
          <div>
            <div className="fb-fh">Контакты</div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              г. Владивосток, Океанский пр-т, 16а, ТЦ «Изумруд Плаза»
            </div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" /></svg>
              <a href="tel:+79089925020">+7 908 992 50 20</a>
            </div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5L2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8s.7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.9l3.1-14.6c.3-1.3-.5-1.9-1.6-1.5zM8.5 13.9l9.8-6.2c.5-.3.9-.1.6.2l-8.1 7.3-.3 3.3-1.5-4.6z" /></svg>
              <a href="https://t.me/izumrudvlpm">Telegram: @izumrudvlpm</a>
            </div>
            <div className="fb-fr">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>
              <a href="mailto:screen_izumrud@mail.ru">screen_izumrud@mail.ru</a>
            </div>
          </div>
          <div>
            <div className="fb-fh">Экран работает</div>
            <div className="fb-fr">Ежедневно, 06:00–23:00</div>
            <div className="fb-fr">Рекламный блок — каждые 5 минут</div>
            <div className="fb-copy">© {new Date().getFullYear()} {COMPANY.short} · <span translate="no">Флэшборд</span>. Информация на сайте носит справочный характер и не является публичной офертой (ст. 437 ГК РФ).</div>
          </div>
        </div>
      </footer>

      <PrivacyModal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onAccept={() => { setConsent(true); setError(""); }}
      />
    </>
  );
}