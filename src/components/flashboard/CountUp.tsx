import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export default function CountUp({ target, duration = 1400, format, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  const display = format ? format(value) : value.toLocaleString("ru-RU");
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
