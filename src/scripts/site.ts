import { initMotion, updateMotionControl } from './motion';
import { startClock } from './clock';
import { startVisitors } from './visitors';
import { initTransitions } from './transitions';
import { startEnhancements } from './enhancements';
import { startTerminal } from './terminal';
import { startCodeBlocks } from './code-blocks';

initMotion();
initTransitions();
let stopVisitors: (() => void) | undefined;
let stopClock: (() => void) | undefined;
let stopEnhancements: (() => void) | undefined;
let stopTerminal: (() => void) | undefined;
let stopCodeBlocks: (() => void) | undefined;

function cleanup() { stopVisitors?.(); stopClock?.(); stopEnhancements?.(); stopTerminal?.(); stopCodeBlocks?.(); }
function startPage() {
  cleanup();
  updateMotionControl();
  stopVisitors = startVisitors();
  stopClock = startClock();
  stopEnhancements = startEnhancements();
  stopTerminal = startTerminal();
  stopCodeBlocks = startCodeBlocks();
}
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:page-load', startPage);
startPage();
