import { defineConfig } from 'astro/config';
import { siteOrigin } from './config/site.mjs';
import { markdownProcessor } from './config/markdown.mjs';

export default defineConfig({
  site: siteOrigin,
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  markdown: { syntaxHighlight: false, processor: markdownProcessor },
});
