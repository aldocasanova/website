import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { motionState, onMotionChange } from './motion';
import { createSignalRenderer } from './signal-renderer';

export function initTransitions() {
  let generation = 0;
  let renderer: ReturnType<typeof createSignalRenderer> = null;
  let watchdog = 0;

  function clear() {
    renderer?.cancel();
    renderer = null;
    window.clearTimeout(watchdog);
    const overlay = document.querySelector<HTMLElement>('#route-transition');
    if (overlay) overlay.hidden = true;
    delete document.documentElement.dataset.routeTransition;
    document.dispatchEvent(new Event('site:transition-end'));
  }

  document.addEventListener('astro:before-preparation', (rawEvent) => {
    const event = rawEvent as TransitionBeforePreparationEvent;
    const current = ++generation;
    clear();
    if (!motionState().enabled || document.hidden || event.from.pathname === event.to.pathname) return;
    const overlay = document.querySelector<HTMLElement>('#route-transition');
    const canvas = overlay?.querySelector('canvas');
    if (!overlay || !canvas) return;
    renderer = createSignalRenderer(canvas, event.direction === 'back');
    if (!renderer) return;
    overlay.hidden = false;
    document.documentElement.dataset.routeTransition = 'cover';
    document.dispatchEvent(new Event('site:transition-start'));
    const activeRenderer = renderer;
    const originalLoader = event.loader;
    // Fetch and animate concurrently. A slow or failed request cannot trap the UI.
    watchdog = window.setTimeout(clear, 1000);
    event.signal.addEventListener('abort', () => { if (generation === current) clear(); }, { once: true });
    event.loader = async () => {
      try {
        await Promise.all([originalLoader(), activeRenderer.play(0, 1, 220)]);
        if (generation === current && (event.signal.aborted || event.defaultPrevented)) clear();
      } catch (error) {
        if (generation === current) clear();
        throw error;
      }
    };
  });

  // The Braille veil is the transition; skip Astro's default crossfade.
  document.addEventListener('astro:before-swap', (event) => {
    const transition = (event as TransitionBeforeSwapEvent).viewTransition;
    // Native ready rejects when a transition is intentionally skipped.
    void transition.ready.catch(() => {});
    transition.skipTransition();
  });
  document.addEventListener('astro:after-swap', () => {
    const current = generation;
    if (!renderer || !motionState().enabled || document.hidden) { clear(); return; }
    document.documentElement.dataset.routeTransition = 'reveal';
    void renderer.play(1, 0, 300).then(() => { if (generation === current) clear(); });
  });
  onMotionChange(() => { if (!motionState().enabled) clear(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  window.addEventListener('resize', clear, { passive: true });
  window.addEventListener('pagehide', clear);
}
