import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import { unified } from '@astrojs/markdown-remark';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// Restrict author HTML as well as rendered Markdown; code fences remain plain text.
export const markdownSchema = {
  ...defaultSchema,
  protocols: { ...defaultSchema.protocols, href: ['https', 'http', 'mailto'], src: [] },
  attributes: { ...defaultSchema.attributes, img: [...(defaultSchema.attributes.img || []), 'loading', 'decoding'] },
};
function localImages() {
  return async (tree) => {
    const imageRoot = await realpath(resolve('public/img'));
    const visit = async (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const p = node.properties || (node.properties = {});
        // Images live in the project, avoiding remote tracking pixels and mixed content.
        if (typeof p.src !== 'string' || !p.src.startsWith('/img/') || p.src.includes('\\')) delete p.src;
        if (p.src) {
          const pathname = decodeURIComponent(new URL(p.src, 'https://local.invalid').pathname);
          const candidate = resolve('public', `.${pathname}`);
          if (!candidate.startsWith(imageRoot + sep)) throw new Error('Markdown image must be inside public/img.');
          const file = await realpath(candidate);
          if (!file.startsWith(imageRoot + sep)) throw new Error('Markdown image must be inside public/img.');
          const meta = await imageMetadata(await readFile(file), p.src);
          p.width = meta.width;
          p.height = meta.height;
        }
        p.loading = 'lazy';
        p.decoding = 'async';
      }
      await Promise.all((node.children || []).map(visit));
    };
    await visit(tree);
  };
}
function noteFigures() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && node.tagName === 'p') {
        const meaningful = (node.children || []).filter((child) => child.type !== 'text' || child.value.trim());
        const image = meaningful.length === 1 && meaningful[0].tagName === 'img' ? meaningful[0] : undefined;
        if (image?.properties?.src) {
          const caption = image.properties.title;
          delete image.properties.title;
          node.tagName = 'figure';
          node.properties = { className: ['note-figure'], 'data-ascii-avoid': '' };
          node.children = [{
            type: 'element', tagName: 'a',
            properties: { href: image.properties.src, className: ['photo-link'], 'data-photo': '', 'data-astro-reload': '', ariaLabel: `Enlarge image: ${image.properties.alt || 'Photograph'}` },
            children: [image],
          }];
          if (typeof caption === 'string' && caption.trim()) node.children.push({
            type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }],
          });
          return;
        }
      }
      (node.children || []).forEach(visit);
    };
    visit(tree);
  };
}
export const markdownProcessor = unified({ rehypePlugins: [[rehypeSanitize, markdownSchema], localImages, noteFigures] });
