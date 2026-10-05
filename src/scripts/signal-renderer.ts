// A text-only signal veil. Canvas batches glyphs; no images or WebGL are used.
export function createSignalRenderer(canvas: HTMLCanvasElement, reverse: boolean) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);
  canvas.dataset.motif = 'signal';
  const cellWidth = Math.max(9, Math.ceil(width / 150));
  const cellHeight = Math.max(16, Math.ceil(height / 70));
  const columns = Math.ceil(width / cellWidth);
  const rows = Math.ceil(height / cellHeight);
  const seed = Math.floor(Math.random() * 10000);
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  const characters = '⠁⠂⠄⠈⠐⠠⡀⢀⣀⣤⣶⣿⠿⣛⠶⠛⢻⡷⣭⠯⡿⣇/\\_[]{}01';
  const cells = Array.from({ length: rows * columns }, (_, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);
    const direction = reverse ? 1 - x / columns : x / columns;
    return { x, y, noise: hash(x, y), threshold: direction * .52 + hash(0, Math.floor(y / 3)) * .22 + hash(x, y) * .22 };
  });

  function draw(coverage: number, time: number) {
    const ctx = context!;
    ctx.clearRect(0, 0, width, height);
    ctx.font = '13px "DejaVu Sans Mono", monospace';
    ctx.textBaseline = 'top';
    const step = Math.floor(time / 90);
    for (const cell of cells) {
      if (coverage <= cell.threshold) continue;
      const x = cell.x * cellWidth;
      const y = cell.y * cellHeight;
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1);
      // Dense leading edge, sparse data behind it: no full-screen white flashes.
      const leading = coverage - cell.threshold < .16;
      if (cell.noise > (leading ? .22 : .91)) {
        ctx.fillStyle = '#fff';
        const index = Math.floor(cell.noise * 100 + step + cell.y) % characters.length;
        ctx.fillText(characters[index], x, y);
      }
    }

  }

  let frame = 0;
  let finish: (() => void) | undefined;
  function cancel() { cancelAnimationFrame(frame); finish?.(); finish = undefined; }
  function play(from: number, to: number, duration: number) {
    cancel();
    return new Promise<void>((resolve) => {
      finish = resolve;
      const start = performance.now();
      let lastFrame = -100;
      function tick(now: number) {
        const progress = Math.min(1, (now - start) / duration);
        if (now - lastFrame >= 1000 / 24 || progress === 1) {
          const eased = progress * progress * (3 - 2 * progress);
          draw(from + (to - from) * eased, now - start);
          lastFrame = now;
        }
        if (progress < 1) frame = requestAnimationFrame(tick);
        else { finish = undefined; resolve(); }
      }
      draw(from, 0);
      frame = requestAnimationFrame(tick);
    });
  }
  return { play, cancel };
}
