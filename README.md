# Elroi Aviation Consult — website

Static site. No build step, no dependencies. Plain HTML, CSS and JavaScript in `public/`.

## Contact details and domain

- Domain: `www.elroiaviationconsult.com` (primary). The bare domain redirects to it.
- Email: info@elroiaviationconsult.com · CEO: Orok.E@elroiaviationconsult.com
- Phone: +1 301-820-1498 · Office: 13852 Crosstie Drive, Germantown, Maryland 20874, USA
- These appear in `public/index.html` (contact section, footer, structured data), `robots.txt`,
  `sitemap.xml` and `.well-known/security.txt`. Update all of them together.
- The logo is `public/assets/logo.svg` (traced from the letterhead); it is also inlined in the page headers.

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
