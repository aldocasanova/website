import { motionState, onMotionChange } from './motion';
import { kaomojis } from './kaomojis';
import { createRandomPicker } from './random-picker';
import { hedgehog } from './hedgehog';
import { asciiCharacters, marginFragments } from './ascii-art';
export const sprites = [...asciiCharacters, ...kaomojis, hedgehog];
const pickVisitor = createRandomPicker<typeof sprites[number]>((sprite) => sprite.name);
const pickFragment = createRandomPicker<typeof marginFragments[number]>((sprite) => sprite.name);

export function startVisitors() {
  const visitor = document.querySelector<HTMLElement>('#ascii-visitor');
  const art = visitor?.querySelector('pre');
  const toggle = document.querySelector<HTMLButtonElement>('#motion-toggle');
  if (!visitor || !art || !toggle) return;

  const reading = location.pathname.startsWith('/blog/') || location.pathname.startsWith('/projects/');
  const controller = new AbortController();
  const { signal } = controller;
  let timer = 0;
  let frameTimer = 0;
  let entranceTimer = 0;
  let exitTimer = 0;
  let animation: Animation | null = null;
  let alive = true;

  const random = (min: number, max: number) => min + Math.random() * (max - min);
  const available = () => alive && !motionState().paused && !document.hidden && !document.documentElement.dataset.routeTransition && !document.documentElement.dataset.photoOpen && !document.documentElement.dataset.commandOpen;
  const enabled = () => available() && motionState().enabled;

  function clearVisitor() {
    window.clearTimeout(timer);
    window.clearTimeout(entranceTimer);
    window.clearTimeout(exitTimer);
    window.clearInterval(frameTimer);
    animation?.cancel();
    animation = null;
    visitor!.hidden = true;
  }

  function schedule(first = false) {
    if (!enabled()) return;
    // Quiet gaps between appearances. Reading pages have longer gaps.
    timer = window.setTimeout(appear, first
      ? random(reading ? 2000 : 600, reading ? 4000 : 1500)
      : random(reading ? 35000 : 18000, reading ? 70000 : 36000));
  }

  function position(width: number, height: number) {
    const margin = 14;
    const gap = 20; // Includes room for the small drift animation.
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = window.innerHeight;
    const obstacles = [...document.querySelectorAll('[data-ascii-avoid], #motion-toggle')]
      .map((element) => element.getBoundingClientRect());
    const candidates: { x: number; y: number }[] = [];
    const startOnRight = Math.random() < .5;
    for (let index = 0; index < 12; index++) {
      candidates.push({
        x: Boolean(index % 2) !== startOnRight ? screenWidth - width - margin : margin,
        y: random(margin, Math.max(margin, screenHeight - height - 65)),
      });
    }
    // On a narrow screen only the unused top/bottom margins may be available.
    candidates.push(
      { x: random(margin, Math.max(margin, screenWidth - width - margin)), y: margin },
      { x: random(margin, Math.max(margin, screenWidth - width - margin)), y: screenHeight - height - 60 },
    );
    return candidates.find(({ x, y }) => x >= 0 && y >= 0 && x + width <= screenWidth
      && y + height <= screenHeight && obstacles.every((rect) =>
        x + width + gap <= rect.left || x - gap >= rect.right
        || y + height + gap <= rect.top || y - gap >= rect.bottom));
  }

  function appear() {
    if (!available()) return;
    const isNarrow = window.innerWidth <= 1000;
    // Compact figures also fit the empty margins on mobile.
    const pool = isNarrow ? sprites.filter((sprite) => sprite.frames.every((frame) => frame.split('\n').length <= 4)) : sprites;
    // The same scheduler and collision checks keep signal fragments scarce and out of the way.
    const isInterference = enabled() && Math.random() < .14;
    const sprite = isInterference ? pickFragment(isNarrow ? marginFragments.slice(0, 1) : marginFragments) : pickVisitor(pool);
    const isKaomoji = sprite.name.startsWith('kaomoji-');
    const isBraille = sprite.name === 'hedgehog';
    visitor!.dataset.kind = isInterference ? 'interference' : isKaomoji ? 'kaomoji' : isBraille ? 'braille' : 'ascii';
    art!.textContent = sprite.frames[0];
    visitor!.hidden = false;
    visitor!.style.visibility = 'hidden';
    // Measure all frames to reserve the largest footprint.
    let width = 0;
    let height = 0;
    for (const frame of sprite.frames) {
      art!.textContent = frame;
      width = Math.max(width, visitor!.offsetWidth);
      height = Math.max(height, visitor!.offsetHeight);
    }
    const spot = position(width, height);
    if (!spot) {
      visitor!.hidden = true;
      if (!motionState().reduced) schedule();
      return;
    }
    visitor!.style.left = `${spot.x}px`;
    visitor!.style.top = `${spot.y}px`;
    visitor!.style.visibility = 'visible';
    visitor!.dataset.character = sprite.name;

    // Keep the art visible without movement when the system requests it.
    art!.textContent = sprite.frames[0];
    if (motionState().reduced) return;

    // One short corrupted frame on arrival; no screen flashing or text effects.
    const signal = ['░', '/', '_', ':'];
    if (!isKaomoji && !isBraille) {
      art!.textContent = sprite.frames[0].replace(/[^\s]/g, (char) =>
        Math.random() < .16 ? signal[Math.floor(Math.random() * signal.length)] : char);
      entranceTimer = window.setTimeout(() => { art!.textContent = sprite.frames[0]; }, 180);
    }

    const enteringFromRight = spot.x > window.innerWidth / 2;
    const gaze = enteringFromRight ? '<' : '>';
    const glance = (frame: string) => frame.replace('o.o', `${gaze}.${gaze}`).replace('o_o', `${gaze}_${gaze}`);
    let step = 0;
    frameTimer = window.setInterval(() => {
      step++;
      // Mostly hold the neutral expression, with an occasional blink or gesture.
      const frame = sprite.frames[step % 3 === 1 ? 1 : step % 5 === 0 ? 2 : 0];
      art!.textContent = !isKaomoji && step % 4 === 2 ? glance(frame) : frame;
    }, isInterference ? 240 : random(1050, 1600));
    const duration = isInterference ? (sprite.name === 'edge-signal' ? 1100 : 2200) : random(6500, 9500);
    const direction = enteringFromRight ? 1 : -1;
    const entrance = Math.random() < .5 ? 'peek' : 'materialize';
    visitor!.dataset.entrance = entrance;
    animation = visitor!.animate([
      { transform: `translate(${entrance === 'peek' ? direction * 8 : 0}px, 0)`, opacity: 0, clipPath: entrance === 'materialize' ? 'inset(0 0 100% 0)' : 'inset(0)' },
      { transform: 'translate(0, 0)', opacity: 1, clipPath: 'inset(0)', offset: .07 },
      { transform: `translate(${-direction * 3}px, -3px)`, opacity: 1, clipPath: 'inset(0)', offset: .6 },
      { transform: `translate(${-direction * 5}px, 0)`, opacity: 1, clipPath: 'inset(0)', offset: .94 },
      { transform: `translate(${-direction * 5}px, 0)`, opacity: 0, clipPath: 'inset(0)' },
    ], { duration, easing: 'linear', fill: 'forwards' });
    if (!isKaomoji && !isInterference && !isBraille && Math.random() < .45) {
      exitTimer = window.setTimeout(() => {
        window.clearInterval(frameTimer);
        art!.textContent = sprite.frames[0].replace(/[^\s]/g, () => Math.random() < .28 ? '_' : ' ');
      }, duration - 350);
    }
    timer = window.setTimeout(() => { clearVisitor(); schedule(); }, duration);
  }

  function restart() {
    clearVisitor();
    if (motionState().reduced) appear();
    else schedule(true);
  }
  const unsubscribe = onMotionChange(restart);
  document.addEventListener('visibilitychange', restart, { signal });
  document.addEventListener('site:transition-start', clearVisitor, { signal });
  document.addEventListener('site:transition-end', restart, { signal });
  document.addEventListener('site:photo-open', clearVisitor, { signal });
  document.addEventListener('site:photo-close', restart, { signal });
  document.addEventListener('site:command-open', clearVisitor, { signal });
  document.addEventListener('site:command-close', restart, { signal });
  document.addEventListener('site:layout-change', restart, { signal });
  // Hide immediately when layout changes, then choose another free area later.
  window.addEventListener('resize', restart, { passive: true, signal });
  window.addEventListener('scroll', restart, { passive: true, signal });
  window.addEventListener('pagehide', () => { alive = false; clearVisitor(); }, { signal });
  window.addEventListener('pageshow', () => { alive = true; restart(); }, { signal });
  restart();
  return () => { alive = false; clearVisitor(); unsubscribe(); controller.abort(); };
}
