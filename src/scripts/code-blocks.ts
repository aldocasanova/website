export function startCodeBlocks() {
  const controller = new AbortController();
  const timers = new Set<number>();
  const added: { pre: HTMLPreElement; wrapper: HTMLElement }[] = [];
  let alive = true;
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code || pre.closest('.code-block')) return;
    const language = [...code.classList].find((name) => name.startsWith('language-'))?.slice(9) || 'text';
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    label.textContent = `[${language}]`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '[copy]';
    button.setAttribute('aria-label', `Copy ${language} code`);
    const feedback = document.createElement('span');
    feedback.className = 'sr-only';
    feedback.role = 'status';
    toolbar.append(label, button, feedback);
    pre.before(wrapper);
    wrapper.append(toolbar, pre);
    added.push({ pre, wrapper });
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', `${language} code`);
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent || '');
        if (!alive) return;
        button.textContent = '[copied]';
        feedback.textContent = 'Code copied.';
      } catch {
        if (!alive) return;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection?.removeAllRanges();
        selection?.addRange(range);
        pre.focus({ preventScroll: true });
        button.textContent = '[select]';
        feedback.textContent = 'Clipboard unavailable. Code selected; use your device’s copy command.';
      } finally {
        if (alive) {
          const timer = window.setTimeout(() => {
            button.textContent = '[copy]';
            button.disabled = false;
            feedback.textContent = '';
            timers.delete(timer);
          }, 1800);
          timers.add(timer);
        }
      }
    }, { signal: controller.signal });
  });
  return () => {
    alive = false;
    controller.abort();
    timers.forEach((timer) => clearTimeout(timer));
    added.forEach(({ pre, wrapper }) => { wrapper.replaceWith(pre); pre.removeAttribute('tabindex'); pre.removeAttribute('aria-label'); });
  };
}
