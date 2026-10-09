import { siteOrigin, isPreview } from '../../config/site.mjs';
import { projects } from '../config';
import { getPosts, postUrl } from '../lib/posts';
export async function GET() {
  const paths = ['/', '/profile/', '/blog/', ...projects.map((p) => `/projects/${p.id}/`), ...(await getPosts()).map((p) => postUrl(p.id))];
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const urls = siteOrigin && !isPreview ? paths.map((path) => `<url><loc>${escape(new URL(path, siteOrigin).href)}</loc></url>`).join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
