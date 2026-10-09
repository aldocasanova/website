// A small family built on the same 11-column grid: brackets, dots, and short gestures.
// Supporting text visitors; the optional Braille hedgehog has its own frames.
const frames = (rows: string[][]) => rows.map((row) => row.map((line) => line.padEnd(11)).join('\n'));
export const asciiCharacters = [
  { name: 'tux', frames: frames([
    ['   .--.', '  |o_o |', '  |:_/ |', ' /|    |\\', '( |    | )', " /'____'\\", ' \\_)(_/'],
    ['   .--.', '  |-_- |', '  |:_/ |', ' /|    |\\', '( |    | )', " /'____'\\", ' \\_)(_/'],
    ['   .--.', '  |o_o | _', '  |:_/ |/', ' /|    |', '( |    |', " /'____'\\", ' \\_)(_/'],
  ]) },
  { name: 'cat', frames: frames([
    [' /\\_/\\', '[ o.o ]', ' / ^ \\ _', '(_____)_/'],
    [' /\\_/\\', '[ -.- ]', ' / ^ \\ |', '(_____)_/'],
    [' /\\_/\\', '[ o.o ]', ' / ^ \\ /', '(_____)_/'],
  ]) },
  { name: 'signal', frames: frames([
    ['+-------+', '|  >_   |', '+--+ +--+', '   [_]'],
    ['+-------+', '|  >    |', '+--+ +--+', '   [_]'],
    ['+-------+', '| [a/c] |', '+--+ +--+', '   [_]'],
  ]) },
  { name: 'rabbit', frames: frames([
    ['  /\\ /\\', ' [ o.o ]', '  / _ \\', ' (_)(_)'],
    ['  /\\ /\\', ' [ -.- ]', '  / _ \\', ' (_)(_)'],
    ['  /\\ /\\', ' [ o.o ]_', '  / _ \\ ', ' (_)(_)'],
  ]) },
  { name: 'robot', frames: frames([
    ['   _|_', '  [o_o]', ' /|___|\\', '  /   \\'],
    ['   _|_', '  [-_-]', ' /|___|\\', '  /   \\'],
    ['   _|_ /', '  [o_o]', ' /|___|', '  /   \\'],
  ]) },
  { name: 'fox', frames: frames([
    [' /\\   /\\', '[  o.o  ]', ' \\  v  /', '  \\___/'],
    [' /\\   /\\', '[  -.-  ]', ' \\  v  /', '  \\___/'],
    [' /\\   /\\', '[  o.o  ]', ' \\  v  /', '  \\___/'],
  ]) },
];
export const marginFragments = [
  { name: 'edge-signal', frames: ['⠂⡀ /_ ░ ⣀ ⠄\n   ⠈ ── ⠁', '⠈⣀ __ / ⠂⡀\n ⠁   ─ ⠄ ', '⠁  / ⣀_ ⠂ ░\n    ── ⠈ '] },
  { name: 'edge-circuit', frames: ['[a/c]──┐\n       ·\n ┌─·───┘\n └──[]', '[a/c]──┐\n       :\n ┌─·───┘\n └──[]', '[a/c]──┐\n       ·\n ┌─:───┘\n └──[]'] },
  { name: 'edge-grid', frames: ['+ · · · +\n:   /   :\n· ──[]  ·\n+ · · · +', '+ · · · +\n·   /   ·\n: ──[]  :\n+ · · · +', '+ · · · +\n:   /   :\n· ──[]  ·\n+ · · · +'] },
];
