try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }

// Optional: set SITE_URL to the final HTTPS origin. No guessed public links.
export function resolveSiteOrigin(env = process.env) {
  const value = env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.');
  }
  return url.origin;
}
export const siteOrigin = resolveSiteOrigin();
export const isPreview = process.env.VERCEL_ENV === 'preview';
