import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { markdownProcessor } from '../config/markdown.mjs';
import { resolveSiteOrigin } from '../config/site.mjs';
import config from '../vercel.json' with { type: 'json' };

const renderer = await createMarkdownProcessor({ syntaxHighlight: false, ...markdownProcessor.options });

test('Markdown preserves notes and code while removing executable HTML and unsafe links', async () => {
  const input = `# Example\n\n**Readable** [link](https://example.com)\n\n<script>alert('unsafe')</script>\n\n<img src="/img/testimage.png" onerror="alert('unsafe')">\n\n<a href="javascript:alert(1)">bad</a><iframe src="https://example.com"></iframe><form action="https://example.com"><input name="password"></form>\n\n\`\`\`js\nconst markup = '<script>example</script>';\n\`\`\``;
  const { code } = await renderer.render(input);
  assert.match(code, /<strong>Readable<\/strong>/);
  assert.match(code, /https:\/\/example.com/);
  assert.match(code, /(?:&lt;|&#x3C;)script(?:>|&gt;|&#x3E;)/);
  assert.doesNotMatch(code, /<(script|iframe|form)\b|onerror=|href="javascript:/i);
});

test('local Markdown images reserve dimensions; remote images have no source', async () => {
  const { code } = await renderer.render('![Local](/img/testimage.png)\n\n![Remote](https://example.com/track.png)');
  assert.match(code, /width="763"/);
  assert.match(code, /height="626"/);
  assert.match(code, /loading="lazy"/);
  assert.doesNotMatch(code, /src="https:/);
});

test('image paths cannot read outside public/img', async (t) => {
  t.mock.method(console, 'error', () => {});
  await assert.rejects(renderer.render('![Escape](/img/../../package.json)'));
});

test('canonical origin accepts explicit HTTPS hosts and rejects unsafe forms', () => {
  assert.equal(resolveSiteOrigin({}), undefined);
  assert.equal(resolveSiteOrigin({ SITE_URL: 'https://example.com/' }), 'https://example.com');
  assert.equal(resolveSiteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app' }), 'https://example.vercel.app');
  for (const SITE_URL of ['http://example.com', 'javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com/?x=1']) assert.throws(() => resolveSiteOrigin({ SITE_URL }));
});

test('production policy blocks third-party scripts, framing, forms and browser sensors', () => {
  const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
  const policy = headers['Content-Security-Policy'];
  assert.match(policy, /script-src 'self';/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /form-action 'none'/);
  assert.doesNotMatch(policy.split('script-src ')[1].split(';')[0], /unsafe-inline|unsafe-eval|https:/);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.match(headers['Permissions-Policy'], /geolocation=\(\)/);
});

test('standalone note images have accessible links and escaped captions without changing inline or linked images', async () => {
  const { code } = await renderer.render('![Accessible description](/img/testimage.png "A <script>alert(1)</script> caption")\n\nAn inline ![detail](/img/testimage.png) stays in its paragraph.\n\n[![Linked image](/img/testimage.png)](https://example.com)');
  assert.equal((code.match(/<figure\b/g) || []).length, 1);
  assert.match(code, /<figure[^>]*data-ascii-avoid/);
  assert.match(code, /<a[^>]*href="\/img\/testimage.png"[^>]*data-photo/);
  assert.match(code, /alt="Accessible description"/);
  assert.match(code, /<figcaption>A (?:&lt;|&#x3C;)script/);
  assert.doesNotMatch(code, /<script\b|<p>\s*<figure/);
  assert.match(code, /<p>An inline <img/);
  assert.match(code, /<a href="https:\/\/example.com"><img/);
});
