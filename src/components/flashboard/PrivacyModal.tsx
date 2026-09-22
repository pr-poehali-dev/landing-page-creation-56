import { useEffect } from "react";
import { createPortal } from "react-dom";
import PrivacyText, { PRIVACY_UPDATED } from "./PrivacyText";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export default function PrivacyModal({ open, onClose, onAccept }: PrivacyModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fb-modal-ov" onClick={onClose}>
      <div className="fb-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="fb-modal-head">
          <div>
            <h3>Политика обработки персональных данных</h3>
            <span>Редакция от {PRIVACY_UPDATED}</span>
          </div>
          <button className="fb-modal-x" onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="fb-modal-body fb-legal">
          <PrivacyText />
        </div>
        <div className="fb-modal-foot">
          {onAccept ? (
            <button
              className="fb-btn"
              onClick={() => {
                onAccept();
                onClose();
              }}
            >
              Прочитал и согласен
            </button>
          ) : (
            <button className="fb-btn" onClick={onClose}>Закрыть</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}