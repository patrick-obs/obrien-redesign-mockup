# O'Brien Systems — Redesign Mockup

Single-file homepage design concept (`index.html`) inspired by the site
architecture of Montel, Spacesaver, Bruynzeel Delta, and Modula.
See `C:\Users\patri\obriensys-site-parity\competitor-architecture-analysis.md`
for the full analysis. The 1:1 replica at obriensys.patrick-obrien.com is
unaffected — this is a separate exploration.

## View locally
Double-click `index.html`, or `python -m http.server 8911 --directory .`
and open http://localhost:8911/

## Publish to redesign.patrick-obrien.com (3 steps, ~5 min)

1. **Create the GitHub repo and push** (from this folder — repo is already
   committed locally, incl. the `CNAME` file):
   ```
   gh repo create obrien-redesign-mockup --public --source . --push
   ```

2. **Enable GitHub Pages** (serves from main branch root; the CNAME file
   sets the custom domain automatically):
   ```
   gh api repos/patrick-obs/obrien-redesign-mockup/pages -X POST -f "source[branch]=main" -f "source[path]=/"
   ```

3. **Add one DNS record** at Squarespace (where patrick-obrien.com DNS lives —
   nameservers are ns-cloud-e*.googledomains.com, managed via your
   Squarespace/Google domain panel):
   ```
   Type:  CNAME
   Host:  redesign
   Value: patrick-obs.github.io
   ```
   After it propagates (minutes to an hour), enable "Enforce HTTPS" in the
   repo's Pages settings. Site will be live at
   https://redesign.patrick-obrien.com

## Notes
- Images hotlink the staging media library (your own uploads on
  obriensys.patrick-obrien.com) — nothing is copied from manufacturers.
- The gold "Design concept" ribbon at the top marks it as a mockup;
  `<meta name="robots" content="noindex">` keeps it out of search.
- Manufacturer names appear as text only (no logo files) pending brand
  asset permission from each partner.
