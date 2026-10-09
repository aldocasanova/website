import { siteOrigin, isPreview } from '../../config/site.mjs';
export function GET() {
  const body = isPreview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : ''}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
