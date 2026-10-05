// Keep visitor selection random without adjacent repeats.
export function createRandomPicker<T>(key: (item: T) => string) {
  let previous = '';
  return (items: readonly T[]): T => {
    const candidates = items.filter((item) => key(item) !== previous);
    const pool = candidates.length ? candidates : items;
    const item = pool[Math.floor(Math.random() * pool.length)];
    previous = key(item);
    return item;
  };
}
