# Security baseline for every DigiCarv static project (GitHub + Netlify)

Copy `netlify.toml` from this repo into new projects, then work through this list.
The honest framing: **you cannot stop a DDoS on a static site yourself.** Netlify absorbs
the traffic at its edge. What you *can* control is (1) what an attack costs you,
(2) how small your attack surface is, and (3) how quickly you notice.

## 1. Control the cost of an attack (most important)

- **Know which Netlify plan the team is on.** Credit-based plans (all accounts created
  after 4 Sept 2025) *pause* the site when credits run out — downtime, not a bill.
  Legacy plans could bill overage with no ceiling (the 2024 $104k static-site incident).
- **Leave auto-recharge OFF** unless the client agrees to a spending cap. Auto-recharge turns
  an attack back into a bill.
- **Never host large files on Netlify** (videos, audio, big PDFs, zip downloads). The $104k
  attack hammered one 3.4 MB MP3. Put heavy media on YouTube/Vimeo or object storage
  with its own budget alerts, and link to it.
- Turn on **usage notifications** in Team settings → Billing so a spike reaches your phone.
- Use a **separate Netlify team per paying client** where possible, so one client's spike
  can't pause everyone's sites.

## 2. Rate limiting (in `netlify.toml`)

- Code-based rules work on all plans: **2 rules per project on Free/Personal, 5 on Pro.**
- The baseline limits each IP to 120 requests/minute across the whole site and rewrites
  anything over that to `/rate-limited.html`.
- Every function or proxy path that calls a paid API (AI, email, SMS, database) gets its
  **own, tighter** rule. That is where real money leaks.
- After each deploy, open the deploy log → *Post-processing* and confirm the rule was
  accepted. An invalid rule does **not** fail the deploy.

## 3. Headers (already in `netlify.toml`)

| Header | Why |
|---|---|
| Content-Security-Policy | Only your own scripts, styles, fonts and images can load. Blocks injected scripts. |
| Strict-Transport-Security | Forces HTTPS. Only add `preload` once the custom domain is permanent. |
| X-Frame-Options / frame-ancestors | Nobody can embed the site in an iframe (clickjacking). |
| X-Content-Type-Options | Stops browsers guessing file types. |
| Referrer-Policy | Doesn't leak full URLs to other sites. |
| Permissions-Policy | Turns off camera, mic, location, payment APIs the site never uses. |
| COOP / CORP | Isolates the site from other origins. |

Rules that keep the CSP strict:
- No inline `<script>` blocks, no `onclick=""`, no `style=""` attributes. Put it in files.
- **Self-host fonts** (as here) instead of Google Fonts: fewer third parties, faster, no
  visitor IPs sent to Google.
- If a site needs analytics, a map or an embed, add only that one domain to the CSP.

Test any deployed site at securityheaders.com and the Mozilla HTTP Observatory. Aim for A or A+.

## 4. Forms

- Netlify Forms with the **honeypot** field (already wired) plus Netlify's built-in
  Akismet spam filtering. Add Netlify's reCAPTCHA option only if spam gets through.
- `maxlength` on every field. Set a **form notification** so leads aren't missed.
- Never send form data to an endpoint you don't control.

## 5. Accounts (the real way sites get taken over)

- **2FA on GitHub and Netlify**, for you and every collaborator. Enforce it at team level.
- GitHub: protect `main` (no force-push, require PRs for client projects), enable
  **secret scanning** and **Dependabot alerts**.
- Netlify: give clients the *lowest* role that works; remove people when projects end.
- No API keys in the repo, ever. Use Netlify environment variables, scoped to the
  functions that need them.
- DNS: lock the domain at the registrar, enable registrar 2FA, and add **CAA** records
  allowing only Let's Encrypt (`0 issue "letsencrypt.org"`), which Netlify uses.

## 6. When to go further

If a client site becomes a real target (government, military, high-profile brand):
- Netlify Enterprise brings UI rate-limit rules, WAF and geo/IP blocking.
- Putting Cloudflare in front of Netlify gives free DDoS shielding, but Netlify advises
  against proxying because it can interfere with its CDN and certificates. Test on a
  staging domain first; don't do it casually.
