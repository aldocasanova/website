export function startClock() {
  const clock = document.querySelector<HTMLTimeElement>('#sucre-time');
  if (!clock) return () => {};
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  function tick() {
    if (document.hidden) return;
    const now = new Date();
    clock!.textContent = format.format(now);
    clock!.dateTime = now.toISOString();
  }
  tick();
  const interval = window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', tick);
  };
}
