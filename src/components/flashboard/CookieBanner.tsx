import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const KEY = "fb-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [location.pathname]);

  function accept() {
    localStorage.setItem(KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fb-cookie" role="dialog" aria-label="Уведомление об использовании cookie">
      <div className="fb-cookie-text">
        Мы используем файлы cookie и сервис Яндекс.Метрика, чтобы сайт работал корректно и мы понимали,
        какие разделы вам интересны. Продолжая пользоваться сайтом, вы соглашаетесь с{" "}
        <Link to="/privacy">политикой конфиденциальности</Link>.
      </div>
      <button className="fb-cookie-btn" onClick={accept}>Хорошо</button>
    </div>
  );
}
