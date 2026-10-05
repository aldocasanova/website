const preferenceKey = 'aldocasanova-motion';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;
try { paused = localStorage.getItem(preferenceKey) === 'off'; } catch { /* Memory state still works. */ }
const listeners = new Set<() => void>();

export function motionState() {
  return { paused, reduced: reducedMotion.matches, enabled: !paused && !reducedMotion.matches };
}

export function onMotionChange(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function updateMotionControl() {
  document.documentElement.dataset.motion = motionState().enabled ? 'on' : 'off';
  const toggle = document.querySelector<HTMLButtonElement>('#motion-toggle');
  if (!toggle) return;
  const { reduced, enabled } = motionState();
  toggle.hidden = false;
  toggle.textContent = reduced ? '[motion: reduced]' : `[motion: ${enabled ? 'on' : 'off'}]`;
  toggle.setAttribute('aria-pressed', String(!enabled));
  toggle.setAttribute('aria-label', reduced
    ? 'All animations disabled; ASCII artwork is still because reduced motion is enabled'
    : `${enabled ? 'Pause' : 'Enable'} all animations`);
  toggle.title = 'Controls all decorative motion';
  toggle.disabled = reduced;
}

function notify() {
  updateMotionControl();
  listeners.forEach((listener) => listener());
}

export function setMotion(enabled: boolean) {
  paused = !enabled;
  try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* Memory state still works. */ }
  notify();
}

export function initMotion() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('#motion-toggle') || reducedMotion.matches) return;
    setMotion(paused);
  });
  reducedMotion.addEventListener('change', notify);
  window.addEventListener('storage', (event) => {
    if (event.key !== preferenceKey && event.key !== null) return;
    paused = event.newValue === 'off';
    notify();
  });
  updateMotionControl();
}
