import { useState } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";

interface SendDocButtonProps {
  docId: number | null;
  clientEmail: string | null;
}

export default function SendDocButton({ docId, clientEmail }: SendDocButtonProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  async function send(email?: string) {
    if (!docId) return;
    setState("sending");
    setMessage("");
    try {
      const res = await fetch(func2url["send-doc"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": localStorage.getItem("fb-admin-key") || "",
        },
        body: JSON.stringify({ docId, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось отправить");
      setState("sent");
      setMessage(`Отправлено на ${data.email}`);
      setAsking(false);
      setTimeout(() => setState("idle"), 4000);
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Ошибка отправки");
    }
  }

  function handleClick() {
    if (clientEmail) {
      send();
    } else {
      setAsking(true);
    }
  }

  if (!docId) return null;

  return (
    <div className="relative shrink-0">
      {!asking && (
        <button
          onClick={handleClick}
          disabled={state === "sending"}
          title={clientEmail ? `Отправить на ${clientEmail}` : "Указать почту и отправить"}
          className={`transition p-1 ${
            state === "sent"
              ? "text-emerald-600"
              : state === "error"
                ? "text-rose-600"
                : "text-slate-400 hover:text-rose-600"
          }`}
        >
          <Icon
            name={state === "sending" ? "Loader2" : state === "sent" ? "MailCheck" : "Mail"}
            size={14}
            className={state === "sending" ? "animate-spin" : ""}
          />
        </button>
      )}

      {asking && (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && emailInput.includes("@")) send(emailInput);
              if (e.key === "Escape") setAsking(false);
            }}
            placeholder="client@mail.ru"
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-40 outline-none focus:border-rose-400"
          />
          <button
            onClick={() => send(emailInput)}
            disabled={!emailInput.includes("@") || state === "sending"}
            className="text-xs bg-slate-900 text-white rounded-lg px-2 py-1 disabled:opacity-40"
          >
            {state === "sending" ? "…" : "Отправить"}
          </button>
          <button
            onClick={() => { setAsking(false); setState("idle"); }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      )}

      {message && (
        <div
          className={`absolute right-0 top-full mt-1 text-[11px] whitespace-nowrap rounded-lg px-2 py-1 z-10 ${
            state === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
