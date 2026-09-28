const HIGHLIGHT = "fb-highlight";

function highlightForm() {
  const box = document.getElementById("lead-form");
  if (!box) return;
  box.classList.remove(HIGHLIGHT);
  void box.offsetWidth;
  box.classList.add(HIGHLIGHT);
  window.setTimeout(() => box.classList.remove(HIGHLIGHT), 2500);
}

export function scrollToLead(e?: { preventDefault: () => void }) {
  e?.preventDefault();

  const form = document.getElementById("lead-form") || document.getElementById("lead");
  if (!form) return;

  highlightForm();

  let ticks = 0;
  const settle = () => {
    const target = document.getElementById("lead-form") || document.getElementById("lead");
    if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
    if (++ticks > 16) {
      window.clearInterval(timer);
      finish();
    }
  };

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    const field = document.getElementById("lead-name") as HTMLInputElement | null;
    if (field && window.matchMedia("(min-width: 961px)").matches) {
      field.focus({ preventScroll: true });
    }
  }

  const timer = window.setInterval(settle, 90);
  settle();

  const stop = () => {
    window.clearInterval(timer);
    finish();
  };
  window.addEventListener("wheel", stop, { passive: true, once: true });
  window.addEventListener("touchstart", stop, { passive: true, once: true });

  if (window.history.replaceState) {
    window.history.replaceState(null, "", "#lead");
  }
}

export { highlightForm };
