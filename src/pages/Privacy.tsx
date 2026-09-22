import { useEffect } from "react";
import { Link } from "react-router-dom";
import PrivacyText, { PRIVACY_UPDATED } from "@/components/flashboard/PrivacyText";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Политика конфиденциальности — Флэшборд";
  }, []);

  return (
    <div id="flashboard-landing">
      <div className="fb-legal">
        <div className="fb-wrap">
          <Link to="/" className="fb-legal-back">← На главную</Link>
          <h1>Политика в отношении обработки персональных данных</h1>
          <p className="fb-legal-date">Редакция от {PRIVACY_UPDATED}</p>
          <PrivacyText />
        </div>
      </div>
    </div>
  );
}
