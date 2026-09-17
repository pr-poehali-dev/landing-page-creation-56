import { useEffect } from "react";
import Icon from "@/components/ui/icon";

interface AdminModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function AdminModal({ open, title, subtitle, icon, onClose, children }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-xl min-h-full sm:min-h-0 sm:my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3 sm:rounded-t-2xl z-10">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Icon name={icon} size={17} className="text-rose-600" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-base truncate">{title}</div>
              {subtitle && <div className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            title="Закрыть"
            className="text-slate-400 hover:text-slate-700 transition p-1 shrink-0"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
