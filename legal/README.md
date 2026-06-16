# Vigilant Legal Documents

Legal content is served at **`/legal`** in the web app. The **source of truth** is TypeScript under `src/lib/legal/`; markdown files in this folder are reference copies for counsel and offline review.

**Before production launch**, update `src/lib/legal/config.ts`:

- `registeredAddress`
- `NEXT_PUBLIC_SITE_URL`
- Contact email addresses
- Governing law / jurisdiction (if not Delaware)

## Documents

| Document | Route |
|---|---|
| Terms of Service | `/legal/terms` |
| Privacy Policy | `/legal/privacy` |
| Acceptable Use Policy | `/legal/acceptable-use` |
| Cookie Policy | `/legal/cookies` |
| End User License Agreement | `/legal/eula` |
| Data Processing Agreement | `/legal/dpa` |
| Subprocessors | `/legal/subprocessors` |
| Security Overview | `/legal/security` |
| Intelligence & AI Disclaimer | `/legal/disclaimer` |

## Software license

Repository source code is **proprietary**. See [LICENSE](../LICENSE) and [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## App Store / Play Store

Use these URLs in store listings:

- Privacy Policy: `https://your-domain/legal/privacy`
- Terms of Service: `https://your-domain/legal/terms`
- EULA: `https://your-domain/legal/eula`

Replace `your-domain` with `NEXT_PUBLIC_SITE_URL`.

## Disclaimer

These documents are template legal text tailored to the Vigilant product stack (Supabase, Anthropic, public-source monitoring). They are **not legal advice**. Have qualified counsel review and customize them for your entity, jurisdictions, and business model before relying on them commercially.
