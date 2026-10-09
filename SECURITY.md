# Security and publication

This is a static site: production serves generated HTML, CSS, JavaScript, and images. There are no application accounts, database credentials, visitor uploads, or server API endpoints. The project does not require secret environment variables; `SITE_URL` is public metadata.

## Implemented protections

- Vercel response headers restrict scripts and network connections to the same origin, disable inline JavaScript and evaluation, forbid frames/plugins/form submissions, prevent framing by other sites, and restrict camera, microphone, location, payment, and USB access.
- `X-Content-Type-Options: nosniff`, a referrer policy, and HSTS accompany the content security policy.
- Styles allow `unsafe-inline` because the Astro client router and the native animation/layout code use runtime styles. This exception applies only to styles. Scripts do not allow `unsafe-inline` or `unsafe-eval`. The policy is tested with the existing router rather than enabling Astro's CSP feature, whose documented ClientRouter support is limited.
- Markdown uses the official unified processor with `rehype-sanitize`; executable HTML and unsafe schemes are removed. Note images must resolve within `public/img/`, have fixed dimensions, and load lazily. Remote image sources are omitted.
- The command palette only executes predefined site actions. It does not evaluate input or call a shell. Text is inserted with DOM text APIs.
- Dependencies are locked. CI checks the build and npm advisory status. Dependabot proposes updates without automatically merging them.
- Private environment files, key files, local tool directories, build output, and logs are ignored by Git. A tracked file is not protected merely by adding an ignore rule later.

## Review performed on 2026-10-08

The local Git history available during review contained two commits and 39 historical blobs. The configured credential-pattern scan found no matches and no tracked private-key/environment files. npm reported no known vulnerabilities after adding the Markdown sanitization dependencies. This is a dated result, not a guarantee of future advisory status or a comprehensive penetration test.

The two JPEG photos contained EXIF metadata but no GPS IFD. EXIF segments were removed from the current files without modifying compressed pixel data. Original image versions still exist in the repository history; no history was rewritten. Photographs and portfolio content are intentionally public, and automated scanning cannot determine whether all personal content should be published.

## Browser validation

The generated site was exercised locally in Chromium with the Vercel header values applied, at widths of 1440, 390, and 320 pixels. Navigation, both project pages, Ctrl+K, code copying, image dialogs, motion settings, reduced-motion, and no-JavaScript navigation were checked. The policy blocked an injected inline script while the intended interactions continued to work. Automated axe WCAG checks found no violations in the tested desktop and mobile pages. These checks do not replace human accessibility testing or verification of the deployed host.

## Deployment and maintenance boundaries

The headers take effect only when the host applies `vercel.json`. Astro's ordinary development/preview server does not apply those headers. Verify the live deployment after publishing; no deployment, Git push, account permissions, branch-protection settings, or two-factor-authentication settings were changed by this review.

Repository write access and build configuration remain trusted. Sanitizing notes does not protect against a collaborator who can modify Astro components or CI workflows. Keep account access protected, review dependency changes, and avoid committing credentials. If a credential is ever published, revoke/rotate it first, then address repository history; deletion in a later commit is insufficient.

Do not post a suspected secret in a public issue. Repository owners can use GitHub's private vulnerability-reporting feature if they choose to enable it. No reporting address or external service is assumed here.

References: [Vercel custom headers](https://vercel.com/docs/project-configuration/vercel-json#headers), [Astro CSP configuration and limitations](https://docs.astro.build/en/reference/configuration-reference/#securitycsp), [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize).
