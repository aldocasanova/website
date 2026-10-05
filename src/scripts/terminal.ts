import { navigate } from 'astro:transitions/client';
import { motionState, setMotion } from './motion';

const commands = [
  { name: 'home', description: 'Return to Sucre', path: '/' },
  { name: 'profile', description: 'About & selected work', path: '/profile/' },
  { name: 'blog', description: 'Open the notes directory', path: '/blog/' },
  { name: 'motion off', description: 'Pause all animations' },
  { name: 'motion on', description: 'Enable animations' },
];

export function startTerminal() {
  const controller = new AbortController();
  const { signal } = controller;
  const dialog = document.querySelector<HTMLDialogElement>('#command-palette')!;
  const input = dialog.querySelector<HTMLInputElement>('#command-input')!;
  const results = dialog.querySelector<HTMLElement>('#command-results')!;
  const status = dialog.querySelector<HTMLElement>('#command-status')!;
  let previousFocus: HTMLElement | null = null;
  let selected = 0;
  let matches = commands;
  let alive = true;

  function select(index: number) {
    selected = index;
    [...results.children].forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
    if (matches.length) input.setAttribute('aria-activedescendant', `command-option-${selected}`);
    else input.removeAttribute('aria-activedescendant');
  }

  function render() {
    const query = input.value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^cd\s+~\//, '');
    matches = commands.filter((command) => command.name.includes(query));
    results.replaceChildren();
    for (const [index, command] of matches.entries()) {
      const option = document.createElement('button');
      option.type = 'button';
      option.id = `command-option-${index}`;
      option.role = 'option';
      option.tabIndex = -1;
      option.dataset.index = String(index);
      const name = document.createElement('span');
      name.textContent = command.name;
      const description = document.createElement('span');
      description.textContent = command.description;
      option.append(name, description);
      results.append(option);
    }
    status.textContent = matches.length ? '' : 'Command not found. Try home, profile, blog, or motion off.';
    select(0);
  }

  function open() {
    if (document.querySelector('#photo-viewer[open]') || dialog.open) return;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.value = '';
    render();
    document.documentElement.dataset.commandOpen = 'true';
    document.dispatchEvent(new Event('site:command-open'));
    dialog.showModal();
    input.focus();
  }

  async function run(index: number) {
    const command = matches[index];
    if (!command) return;
    if (command.path) {
      dialog.close();
      if (location.pathname === command.path) return;
      try { await navigate(command.path); }
      catch { if (alive) location.assign(command.path); }
    } else {
      const enabled = command.name === 'motion on';
      setMotion(enabled);
      status.textContent = enabled && motionState().reduced
        ? 'Motion preference saved. System reduced motion keeps animations off.'
        : `Motion ${enabled ? 'on' : 'off'}.`;
      input.focus();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() !== 'k' || (!event.ctrlKey && !event.metaKey) || event.altKey || event.isComposing) return;
    if (document.querySelector('#photo-viewer[open]')) return;
    event.preventDefault();
    if (dialog.open) dialog.close(); else open();
  }, { signal });
  input.addEventListener('input', render, { signal });
  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (matches.length) select((selected + (event.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length);
    } else if (event.key === 'Enter') { event.preventDefault(); void run(selected); }
  }, { signal });
  results.addEventListener('click', (event) => {
    const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-index]') : null;
    if (option) void run(Number(option.dataset.index));
  }, { signal });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }, { signal });
  dialog.addEventListener('close', () => {
    // A queued close event must not unlock a dialog reopened in the same frame.
    if (dialog.open) return;
    delete document.documentElement.dataset.commandOpen;
    document.dispatchEvent(new Event('site:command-close'));
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }, { signal });

  return () => {
    alive = false;
    controller.abort();
    if (dialog.open) dialog.close();
    delete document.documentElement.dataset.commandOpen;
  };
}
