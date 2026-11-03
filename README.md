# Elroi Aviation Consult — website

Static site. No build step, no dependencies. Plain HTML, CSS and JavaScript in `public/`.

## Before launch: replace placeholders

Search the project for `YOURDOMAIN` and `000` and replace:

| Where | What |
|---|---|
| `public/index.html` | Canonical URL, og:url, og:image, email, phone, city/country |
| `public/robots.txt`, `public/sitemap.xml` | Domain |
| `public/.well-known/security.txt` | Security contact email and domain |

Also add `public/assets/og-image.png` (1200×630) for link previews, or remove that meta tag.

## Deploy (GitHub → Netlify)

1. Create a GitHub repo and push this folder (the root holds `netlify.toml`).
2. In Netlify: **Add new project → Import from Git →** pick the repo.
   Build command: *(empty)*. Publish directory: `public` (already set in `netlify.toml`).
3. **Forms:** Project configuration → Forms → enable form detection, then redeploy.
   Add an email notification so enquiries reach the client.
4. Add the custom domain and let Netlify issue HTTPS.
5. Open the deploy log → *Post-processing* and check the rate-limit rule was accepted.
6. Test headers at securityheaders.com.

## Structure

```
netlify.toml            headers, rate limit, caching
SECURITY.md             reusable security checklist for all projects
public/
  index.html            the site
  thanks.html           form success page
  404.html              not found
  rate-limited.html     shown when an IP exceeds the rate limit
  assets/css/styles.css
  assets/js/boot.js     tiny script that runs before paint (enables scroll animations)
  assets/js/main.js     motion: reveals, live diagram, tank-to-wing zoom, scroll effects
  assets/js/vendor/     Lenis smooth scroll, self-hosted (MIT licence included)
  assets/img/           photos as resized WebP (phones get a portrait crop of the hero)
  assets/og-image.jpg   link preview image for WhatsApp, LinkedIn etc.
  assets/fonts/         Archivo variable font, self-hosted (SIL OFL licence included)
```

## Editing

- Colours live at the top of `styles.css` (`--black`, `--white`, `--gold`).
- Don't add inline `<script>` or `style=""` attributes; the Content-Security-Policy blocks them.

- All motion switches off for visitors who set "reduce motion" on their device.

## Photos

- Replace a photo by keeping the same file names and widths (e.g. `tank-farm-640.webp`, `-1080`, `-1600`).
- Check you have the right to use every photo before launch. Several were sourced from the web.
