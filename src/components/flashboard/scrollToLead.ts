export function scrollToLead(e?: { preventDefault: () => void }) {
  e?.preventDefault();

  const form = document.getElementById("lead-form") || document.getElementById("lead");
  if (!form) return;

  let ticks = 0;
  const settle = () => {
    const target = document.getElementById("lead-form") || document.getElementById("lead");
    if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
    if (++ticks > 16) {
      window.clearInterval(timer);
      const field = document.getElementById("lead-name") as HTMLInputElement | null;
      if (field && window.matchMedia("(min-width: 961px)").matches) {
        field.focus({ preventScroll: true });
      }
    }
  };

  const timer = window.setInterval(settle, 90);
  settle();

  const stop = () => window.clearInterval(timer);
  window.addEventListener("wheel", stop, { passive: true, once: true });
  window.addEventListener("touchstart", stop, { passive: true, once: true });

  if (window.history.replaceState) {
    window.history.replaceState(null, "", "#lead");
  }
}
