export function prefersReducedMotion() {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("reduce-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function whenFontsReady() {
  return Promise.race([
    document.fonts.ready.catch(() => undefined),
    new Promise((resolve) => {
      window.setTimeout(resolve, 1500);
    }),
  ]);
}
