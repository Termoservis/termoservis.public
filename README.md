# Termoservis websites

Two fast, static Croatian websites with a shared company picker:

- `/` — **Termoservis**: servicing, repairs, commissioning, and maintenance. Primary contact: Mario Toplek, **098 600 122**.
- `/md/` — **Termoservis MD**: heating, cooling, renewable-energy, plumbing, and drainage installation. Primary contact: Dejan Balenta, **099 60 11 222**.

Each page has its own official logo, company information, services, contact details, and canonical URL. The legacy `/#md` link redirects to `/md/`. Navigation, contact links, and native disclosure panels work without JavaScript; the small optional script closes the mobile menu and handles the old hash link.

## Development and deployment

Use Node.js 24 and Chrome/Chromium for the development tools. No Node.js, libraries, or framework runtime is sent to visitors.

```sh
npm ci --ignore-scripts
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173/` and `/md/`. Serve the site at the domain root, because shared assets and company links use absolute paths.

Netlify reads `netlify.toml`, runs `npm run build`, and publishes only `dist/`. The build copies an explicit list of public files; source archives, development dependencies, and audit reports are not published. The existing original assets remain in Git for reference, but only assets used by the new site are copied into the deployment.

`npm run format` formats the HTML, shared CSS, and development scripts. There is no mandatory bundler or client-side build step.

## Performance checks

```sh
npm run audit
```

This builds the site, starts an ephemeral loopback server, and runs Lighthouse 13.5.0 on both pages in mobile and desktop modes. Chrome is discovered automatically; set `CHROME_PATH` if needed. Each page/device combination uses three cold-browser runs; budgets use the median of each metric to limit CI host noise. All runs and representative HTML/JSON reports are saved to `.lighthouse/`.

The same check runs on pull requests and pushes to `master`. It fails if either page exceeds any of these limits:

| Measure | Budget |
| --- | --- |
| Performance, accessibility, best practices, SEO | At least 95/100 each |
| Largest Contentful Paint | At most 2.5 seconds |
| Total Blocking Time | At most 200 milliseconds |
| Cumulative Layout Shift | At most 0.1 |
| Audited page transfer | At most 250 KiB |

Initial controlled comparison against the original website at `9581b8b`, using the same Chrome, machine, and Lighthouse simulated throttling:

| Website | Mobile performance | Desktop performance |
| --- | ---: | ---: |
| Original company site | 58 | 97 |
| Redesigned Termoservis | 99 | 100 |
| Termoservis MD | 100 | 100 |

Both new pages scored 100 for accessibility, best practices, and SEO in these runs. These are Lighthouse lab results, not a guarantee of an identical public PageSpeed Insights score or field Core Web Vitals. Hosting, device, network, and audit conditions affect measurements.

For hosted performance checks, use the immutable Netlify deploy permalink rather than the `deploy-preview` URL. The preview URL injects the Netlify feedback drawer and its third-party resources, which are not part of the production website. [Netlify documentation](https://docs.netlify.com/deploy/review-deploys/netlify-drawer-for-feedback/overview/#site--browser-requirements-to-use-netlify-drawer).

Performance choices: responsive WebP photos; explicit image dimensions; lazy-loaded team photos; system fonts; a small deferred script; no analytics, third-party embeds, or web-font requests. Videos and the chimney PDF load only when a visitor opens their links. Netlify asset cache rules are in `_headers`; change asset filenames when replacing cached images.

## Content review before launch

Company details, staff portraits, service authorizations, and registration data were restored from the original website. Confirm these details before publishing the redesign. In particular, the original registered capital is still listed in kuna; it has been preserved rather than converted or replaced with an unverified amount. Domagoj's original portrait is monochrome; the other portraits retain their original colours.

The root page retains the office landline as a secondary contact. Termoservis MD has its own contact page and does not present the Termoservis service team or service authorizations as its own.
