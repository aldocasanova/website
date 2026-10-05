import { motionState, onMotionChange } from './motion';

export function startEnhancements() {
  const controller = new AbortController();
  const { signal } = controller;
  const effects = new Set<Animation>();
  const play = (element: Element, frames: Keyframe[], duration = 150) => {
    if (!motionState().enabled) return;
    const animation = element.animate(frames, { duration, easing: 'ease-out' });
    effects.add(animation);
    void animation.finished.then(() => effects.delete(animation), () => effects.delete(animation));
  };
  const stopEffects = () => { effects.forEach((effect) => effect.cancel()); effects.clear(); };
  const unsubscribe = onMotionChange(() => { if (!motionState().enabled) stopEffects(); });

  // Markdown photos become ordinary links first, then gain the modal enhancement.
  document.querySelectorAll<HTMLImageElement>('.prose img').forEach((image) => {
    if (image.closest('a, button')) return;
    const link = document.createElement('a');
    link.className = 'photo-link';
    link.href = image.currentSrc || image.src;
    link.dataset.photo = '';
    link.dataset.astroReload = '';
    link.setAttribute('aria-label', `Enlarge image: ${image.alt || 'Photograph'}`);
    image.before(link);
    link.append(image);
  });

  const dialog = document.querySelector<HTMLDialogElement>('#photo-viewer');
  const preview = dialog?.querySelector<HTMLImageElement>('#viewer-image');
  const caption = dialog?.querySelector<HTMLElement>('#viewer-caption');
  let trigger: HTMLAnchorElement | null = null;
  const unlock = () => {
    delete document.documentElement.dataset.photoOpen;
    document.dispatchEvent(new Event('site:photo-close'));
  };
  if (dialog && preview && caption) {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-photo]') : null;
      if (!link || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      trigger = link;
      const source = link.querySelector('img');
      preview.src = link.href;
      preview.alt = source?.alt || 'Photograph';
      caption.textContent = source?.alt || '';
      document.documentElement.dataset.photoOpen = 'true';
      document.dispatchEvent(new Event('site:photo-open'));
      dialog.showModal();
      play(dialog, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }]);
    }, { signal });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }, { signal });
    dialog.addEventListener('close', () => {
      stopEffects();
      unlock();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    }, { signal });
  }

  document.querySelectorAll<HTMLDetailsElement>('.project-disclosure').forEach((details) => {
    details.addEventListener('toggle', () => {
      const content = details.querySelector('.project-details-content');
      if (details.open && content) play(content, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }], 160);
      document.dispatchEvent(new Event('site:layout-change'));
    }, { signal });
  });

  const progress = document.querySelector<HTMLElement>('#reading-progress');
  const article = document.querySelector<HTMLElement>('[data-reading-content]');
  let frame = 0;
  let observer: ResizeObserver | undefined;
  if (progress && article) {
    const bar = progress.querySelector<HTMLElement>('span')!;
    let previous = -1;
    function update() {
      frame = 0;
      const bottom = article!.getBoundingClientRect().bottom + window.scrollY;
      const distance = Math.max(0, bottom - window.innerHeight);
      const fraction = distance === 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / distance));
      const percent = Math.round(fraction * 100);
      bar.style.transform = `scaleX(${fraction})`;
      if (percent !== previous) progress!.setAttribute('aria-valuenow', String(percent));
      previous = percent;
      progress!.hidden = false;
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', queue, { passive: true, signal });
    window.addEventListener('resize', queue, { passive: true, signal });
    article.addEventListener('load', queue, { capture: true, signal });
    observer = new ResizeObserver(queue);
    observer.observe(article);
    update();
  }

  return () => {
    controller.abort();
    unsubscribe();
    stopEffects();
    cancelAnimationFrame(frame);
    observer?.disconnect();
    if (dialog?.open) dialog.close();
    delete document.documentElement.dataset.photoOpen;
  };
}
