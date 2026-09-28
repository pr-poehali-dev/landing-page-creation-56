import Icon from "@/components/ui/icon";

const SOURCES: Record<string, { label: string; icon: string; cls: string }> = {
  manual: {
    label: "Добавлена вручную",
    icon: "PhoneCall",
    cls: "text-slate-500 bg-slate-100",
  },
  form_tg: {
    label: "С сайта · Telegram",
    icon: "Send",
    cls: "text-sky-700 bg-sky-50",
  },
  form_mail: {
    label: "С сайта · почта",
    icon: "Mail",
    cls: "text-violet-700 bg-violet-50",
  },
  form: {
    label: "С сайта",
    icon: "Globe",
    cls: "text-slate-500 bg-slate-100",
  },
};

export default function SourceBadge({ source }: { source: string }) {
  const meta = SOURCES[source] || SOURCES.form;

  return (
    <div className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 mt-1 ${meta.cls}`}>
      <Icon name={meta.icon} size={10} />
      {meta.label}
    </div>
  );
}
