# Sonline website

Frontend-only corporate site and product portfolio for Sonline. Vite + React + TypeScript, no backend,
database, auth or server integrations.

```bash
npm install
npm run dev
npm run build
npm run typecheck && npm run lint && npm test
```

## Sign-in
Every page shows a sign-in screen first. Approved accounts are listed in `src/data/stakeholders.ts` (email plus a
SHA-256 hash of the password, not the password). Add one with:

```bash
node scripts/hash-password.mjs someone@sonline.us "their password"
```
and paste the printed line into the list. Failed attempts are capped at 60 per browser (`MAX_FAILED_ATTEMPTS`).

**This is a convenience gate, not security.** The account list, the site code and the infrastructure data are all
delivered to the browser, so anyone technical can bypass the check or read the data directly. Do not rely on it for
anything that must stay confidential. There is no revocation, no per-user logging and no server-side attempt limit.

Routes: `/` (Hero, Overview, Catalog, Infrastructure, About), `/products/:slug`. Filters live in the URL query
(`?q=&env=&cat=&vm=&repo=1`). The host must serve `index.html` for unknown paths (SPA fallback).

## Where data lives

| File | Contents |
| --- | --- |
| `src/data/types.ts` | All types. Classification, operational state and completeness are separate. |
| `src/data/portfolio.ts` | **Public-safe** data: repositories, public entries (name, hostnames, classification), products. |
| `src/data/internal/infrastructure.ts` | **Review-only** data: VM ids, ports, notes, operational state, review flags, and entries withheld from the public catalog. |

Source of the inventory: the Excel workbook snapshot dated 6 Oct 2026 as transcribed in the project brief. The workbook
file was not in the repository; values are as supplied there and should be re-checked against the workbook.

## Adding a product
1. If it has an inventory entry, add a `PublicEntry` to `publicEntries` (`e('inv-34', 'Name', ['host.example.com'], 'Demo')`).
   Add its VM/port/notes as an `InfraDetail` in `infraDetails`. Withhold it by moving the entry to `internalEntries`
   with `listing: 'internal-only'`.
2. Add a product with `p(...)` in `portfolio.ts`, linking entry ids via `inventoryLinks`.
3. Add a repository to `repositories` and reference its id in `repositoryIds`. Never build a URL from a product name.
4. Leave `description` as `null` until the purpose is confirmed. Completeness is derived, not hand-set.
`npm test` fails if an entry is not linked to exactly one product.

## Visibility and security
- After sign-in the infrastructure inventory (VM names, ports, notes) loads as a separate JavaScript chunk. Sign-in is
  not access control; that chunk's URL is reachable by anyone.
- No credentials, SSH details, private addresses or secrets exist in the repo (only password hashes, once added).
- The infrastructure view is a recorded snapshot, not monitoring. No status is inferred; `verified-running` is unused.

## Security headers
`public/_headers` (Netlify) sets a strict CSP (`default-src 'none'`, scripts/styles/images/fonts/connect from `self` only,
no inline code, no framing, no `base`/`object`), HSTS, `nosniff`, `no-referrer`, a locked-down Permissions-Policy,
COOP/CORP, `noindex`, and immutable caching for hashed assets. `robots.txt` disallows crawling. The app needs no inline
scripts or styles; if you add any (or a third-party script, font or analytics), update the CSP deliberately.
These headers harden the page against XSS and framing; they do not make the sign-in a real access control.
On other hosts, copy the same headers into that host's configuration.

## URL assumption
The inventory records hostnames only. Links are built as `https://<host>` (`src/lib/url.ts`, `PUBLIC_URL_SCHEME`),
host lowercased for the href only. This is an assumption to confirm per host (notably the port-80 SupportIQ UAT entry).

## Review before public deployment
- Approve publishing every hostname in the catalog, including `resourz.net` demos and UAT entries.
- Decide whether UAT and Demo environments belong on the public site.
- Keep withheld: Fenix, Winter Park (internal only), BallotDA backend API (DEAD), Sonline AI backend API (disabled),
  VoterSMS (Nginx default, no vhost), Edukadu (new) (overlapping hostname).
- Confirm VM, port and note data may be published at all (default: no).
- Confirm Idaho SOS VM association, Edukadu (new) hostnames, `IDAdminrules` casing, and SupportIQ UAT scheme.
- Confirm provisional categories and cautious descriptions; supply official ones.
- Confirm the repository-to-deployment mapping for Absentee Ballot and VoterSMS; check repository access.
- Possible relationship of "Indiana CF" to CF-Track is **not** asserted anywhere; confirm if intended.
